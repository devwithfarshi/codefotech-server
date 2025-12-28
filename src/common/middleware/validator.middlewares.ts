import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';
import ApiError from '../utils/apiError';

/**
 * Safely extracts field names from a Zod schema if possible
 * @param schema The schema to extract field names from
 * @returns An array of field names or an empty array if extraction fails
 */
const extractSchemaFields = (schema: ZodType<any>): string[] => {
  try {
    // Try to access the internal representation of the schema
    // This is not guaranteed to work with all Zod schemas
    const schemaAny = schema as any;

    // Check for different types of schemas that might contain field definitions
    if (schemaAny._def && schemaAny._def.shape) {
      // For ZodObject
      return Object.keys(schemaAny._def.shape);
    }

    if (schemaAny.shape) {
      // Alternative structure some schemas might have
      return Object.keys(schemaAny.shape);
    }

    // For ZodEffects (refined schemas) try to access the inner schema
    if (schemaAny._def && schemaAny._def.schema) {
      return extractSchemaFields(schemaAny._def.schema);
    }

    // No recognizable structure found
    return [];
  } catch (e) {
    // If any errors occur during extraction, return an empty array
    return [];
  }
};

/**
 * Formats ZodError into a format compatible with the existing ApiError class
 * @param error The ZodError instance
 * @param schema The original schema that was validated against
 * @returns A formatted message and errors array
 */
const formatZodError = (error: ZodError, schema: any): { message: string; errors: any[] } => {
  const isEmptyBodyWithAllOptional = () => {
    if (!schema.body) return false;

    try {
      schema.body.parse({});
      return true;
    } catch (e) {
      return false;
    }
  };
  if (
    error.issues.length === 1 &&
    error.issues[0].path.length === 0 &&
    error.issues[0].message === 'Required' &&
    isEmptyBodyWithAllOptional()
  ) {
    return { message: '', errors: [] };
  }
  const formattedErrors = error.issues.map((err) => {
    if (err.path.length === 0 && err.message === 'Required') {
      return {
        path: 'request',
        message: 'Request body is empty. Required fields are missing.',
      };
    }

    return {
      path: err.path.join('.') || 'request',
      message: err.message,
    };
  });

  if (
    formattedErrors.some(
      (err) => err.path === 'request' && err.message.includes('Required fields are missing')
    )
  ) {
    let missingFields: string[] = [];

    if (schema.body) {
      missingFields = extractSchemaFields(schema.body);
    }

    if (missingFields.length > 0) {
      return {
        message: `Required fields missing: ${missingFields.join(', ')}`,
        errors: [
          ...formattedErrors,
          ...missingFields.map((field) => ({
            path: field,
            message: `${field} is required`,
          })),
        ],
      };
    }
  }

  const message =
    formattedErrors.length === 1 && formattedErrors[0].path === 'request'
      ? 'Request validation failed. The request body is empty or invalid.'
      : 'Validation failed';

  return { message, errors: formattedErrors };
};

/**
 * Middleware that validates request data against a Zod schema
 * @param schema The Zod schema to validate against (for params, query, and body)
 */
const validate =
  (schema: { params?: ZodType<any>; query?: ZodType<any>; body?: ZodType<any> }) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      // Check if the body is empty when body schema exists
      if (schema.body && (!req.body || Object.keys(req.body).length === 0)) {
        // Determine if the schema is an object with all optional fields
        const isAllOptional = () => {
          try {
            // Try to parse an empty object
            if (schema.body) {
              schema.body.parse({});
            }
            // If parsing succeeds, all fields must be optional
            return true;
          } catch (e) {
            // If parsing fails, some fields are required
            return false;
          }
        };

        // Only error if there are required fields
        if (!isAllOptional()) {
          const requiredFields = extractSchemaFields(schema.body);
          const message =
            requiredFields.length > 0
              ? `Required fields missing: ${requiredFields.join(', ')}`
              : 'Request body is empty. All required fields are missing.';

          const errors =
            requiredFields.length > 0
              ? requiredFields.map((field) => ({
                  path: field,
                  message: `${field} is required`,
                }))
              : [{ path: 'request', message: 'Request body cannot be empty' }];

          return next(ApiError.badRequest(message, errors));
        } else {
          // If all fields are optional, initialize with empty object
          req.body = {};
        }
      }

      // Continue with validation
      if (schema.params) {
        Object.assign(req.params, await schema.params.parseAsync(req.params));
      }

      if (schema.query) {
        Object.assign(req.query, await schema.query.parseAsync(req.query));
      }

      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod error messages to be compatible with ApiError
        const { message, errors } = formatZodError(error, schema);

        // Use the existing ApiError.badRequest static method
        return next(ApiError.badRequest(message, errors));
      }

      // If it's not a Zod error, pass it along
      next(error);
    }
  };

export default validate;

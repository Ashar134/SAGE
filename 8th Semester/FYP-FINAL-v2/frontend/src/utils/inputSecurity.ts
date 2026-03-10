/**
 * Input Security Utilities
 * Prevents XSS, HTML injection, spam, and oversized payloads
 */

// ============================================================================
// Configuration - Field Limits
// ============================================================================

export const INPUT_LIMITS = {
    // Personal Info
    firstName: { min: 1, max: 50 },
    lastName: { min: 1, max: 50 },
    email: { min: 5, max: 100 },
    phone: { min: 7, max: 20 },
    location: { min: 2, max: 100 },
    linkedIn: { min: 0, max: 200 },
    portfolio: { min: 0, max: 200 },

    // Text Areas
    summary: { min: 0, max: 2000 },
    skillsText: { min: 0, max: 1000 },

    // Experience/Education
    jobTitle: { min: 2, max: 100 },
    company: { min: 2, max: 100 },
    degree: { min: 2, max: 100 },
    institution: { min: 2, max: 150 },
    description: { min: 0, max: 1500 },

    // Projects
    projectName: { min: 2, max: 100 },
    projectDescription: { min: 0, max: 1000 },
    projectUrl: { min: 0, max: 300 },

    // Certificates
    certificateName: { min: 2, max: 150 },
    issuer: { min: 2, max: 100 },

    // Research
    researchTitle: { min: 2, max: 200 },
    researchDescription: { min: 0, max: 1500 },
} as const;

// ============================================================================
// XSS & HTML Injection Prevention
// ============================================================================

/**
 * Sanitizes input by escaping HTML entities to prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';

    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Removes all HTML tags from input
 */
export function stripHTML(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Removes potentially dangerous patterns (script tags, event handlers, etc.)
 */
export function removeDangerousPatterns(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove script tags and their content
    let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: protocol
    cleaned = cleaned.replace(/javascript\s*:/gi, '');

    // Remove data: protocol (can be used for XSS)
    cleaned = cleaned.replace(/data\s*:/gi, '');

    // Remove vbscript: protocol
    cleaned = cleaned.replace(/vbscript\s*:/gi, '');

    // Remove expression() (CSS XSS)
    cleaned = cleaned.replace(/expression\s*\(/gi, '');

    return cleaned;
}

// ============================================================================
// SQL Injection Prevention (Frontend layer - backend should also validate)
// ============================================================================

/**
 * Detects potential SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(--)/, // SQL comment
        /(;.*\b(SELECT|INSERT|UPDATE|DELETE|DROP)\b)/i,
        /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i, // OR 1=1, AND 1=1
        /('.*\b(OR|AND)\b.*')/i, // ' OR '
        /(\/\*.*\*\/)/i, // Block comments
        /(\bEXEC\b|\bEXECUTE\b)/i,
        /(\bxp_)/i, // Extended stored procedures
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitizes input to prevent SQL injection
 */
export function sanitizeSQLInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Escape single quotes
    let cleaned = input.replace(/'/g, "''");

    // Remove SQL comments
    cleaned = cleaned.replace(/--/g, '');
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove semicolons that could end statements
    cleaned = cleaned.replace(/;/g, '');

    return cleaned;
}

// ============================================================================
// Spam Detection
// ============================================================================

/**
 * Detects potential spam patterns in input
 */
export function detectSpam(input: string): { isSpam: boolean; reason?: string } {
    if (!input || typeof input !== 'string') return { isSpam: false };

    // Check for excessive repeated characters
    if (/(.)\1{10,}/i.test(input)) {
        return { isSpam: true, reason: 'Excessive repeated characters' };
    }

    // Check for too many URLs
    const urlCount = (input.match(/https?:\/\//gi) || []).length;
    if (urlCount > 5) {
        return { isSpam: true, reason: 'Too many URLs' };
    }

    // Check for common spam keywords
    const spamKeywords = [
        /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|act now|limited time)\b/gi,
        /\b(buy now|free money|million dollars|nigerian prince)\b/gi,
    ];

    for (const pattern of spamKeywords) {
        if (pattern.test(input)) {
            return { isSpam: true, reason: 'Contains spam keywords' };
        }
    }

    // Check for excessive special characters
    const specialCharRatio = (input.match(/[!@#$%^&*()_+=\[\]{}|\\:";'<>?,./~`]/g) || []).length / input.length;
    if (specialCharRatio > 0.3 && input.length > 20) {
        return { isSpam: true, reason: 'Excessive special characters' };
    }

    return { isSpam: false };
}

// ============================================================================
// Input Validation
// ============================================================================

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    sanitizedValue: string;
}

/**
 * Validates and sanitizes a text input field
 */
export function validateTextInput(
    value: string,
    fieldName: keyof typeof INPUT_LIMITS,
    options: { required?: boolean; allowHTML?: boolean } = {}
): ValidationResult {
    const limits = INPUT_LIMITS[fieldName];
    const { required = false, allowHTML = false } = options;

    // Handle empty input
    if (!value || value.trim() === '') {
        if (required) {
            return { isValid: false, error: 'This field is required', sanitizedValue: '' };
        }
        return { isValid: true, sanitizedValue: '' };
    }

    let sanitized = value.trim();

    // Remove dangerous patterns
    sanitized = removeDangerousPatterns(sanitized);

    // Strip HTML if not allowed
    if (!allowHTML) {
        sanitized = stripHTML(sanitized);
    }

    // Check for SQL injection
    if (containsSQLInjection(sanitized)) {
        return { isValid: false, error: 'Invalid characters detected', sanitizedValue: '' };
    }

    // Check for spam
    const spamCheck = detectSpam(sanitized);
    if (spamCheck.isSpam) {
        return { isValid: false, error: spamCheck.reason, sanitizedValue: '' };
    }

    // Validate length
    if (sanitized.length < limits.min) {
        return {
            isValid: false,
            error: `Minimum ${limits.min} characters required`,
            sanitizedValue: sanitized
        };
    }

    if (sanitized.length > limits.max) {
        return {
            isValid: false,
            error: `Maximum ${limits.max} characters allowed`,
            sanitizedValue: sanitized.substring(0, limits.max)
        };
    }

    return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
    const baseValidation = validateTextInput(email, 'email', { required: true });
    if (!baseValidation.isValid) return baseValidation;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(baseValidation.sanitizedValue)) {
        return { isValid: false, error: 'Invalid email format', sanitizedValue: baseValidation.sanitizedValue };
    }

    return baseValidation;
}

/**
 * Validates phone number
 */
export function validatePhone(phone: string): ValidationResult {
    if (!phone || phone.trim() === '') {
        return { isValid: true, sanitizedValue: '' };
    }

    // Remove all non-digit characters except + for country code
    const sanitized = phone.replace(/[^\d+\-\s()]/g, '').trim();

    // Check length
    const digitsOnly = sanitized.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, error: 'Invalid phone number', sanitizedValue: sanitized };
    }

    return { isValid: true, sanitizedValue: sanitized };
}

/**
 * Validates URL format
 */
export function validateURL(url: string, fieldName: 'linkedIn' | 'portfolio' | 'projectUrl' = 'portfolio'): ValidationResult {
    if (!url || url.trim() === '') {
        return { isValid: true, sanitizedValue: '' };
    }

    let sanitized = url.trim();

    // Remove dangerous patterns
    sanitized = removeDangerousPatterns(sanitized);

    // Check for javascript: or data: protocols
    if (/^(javascript|data|vbscript):/i.test(sanitized)) {
        return { isValid: false, error: 'Invalid URL protocol', sanitizedValue: '' };
    }

    // Basic URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlRegex.test(sanitized)) {
        return { isValid: false, error: 'Invalid URL format', sanitizedValue: sanitized };
    }

    // Check length
    const limits = INPUT_LIMITS[fieldName];
    if (sanitized.length > limits.max) {
        return { isValid: false, error: `URL too long (max ${limits.max} characters)`, sanitizedValue: sanitized };
    }

    return { isValid: true, sanitizedValue: sanitized };
}

// ============================================================================
// Sanitize Profile Data (for entire profile object)
// ============================================================================

export interface SanitizedProfile {
    isValid: boolean;
    errors: Record<string, string>;
    data: Record<string, unknown>;
}

/**
 * Sanitizes and validates an entire profile object
 */
export function sanitizeProfileData(profile: Record<string, unknown>): SanitizedProfile {
    const errors: Record<string, string> = {};
    const sanitizedData: Record<string, unknown> = {};

    // Sanitize each field
    const textFields: Array<{ key: string; fieldName: keyof typeof INPUT_LIMITS; required?: boolean }> = [
        { key: 'firstName', fieldName: 'firstName', required: true },
        { key: 'lastName', fieldName: 'lastName', required: true },
        { key: 'location', fieldName: 'location' },
        { key: 'summary', fieldName: 'summary' },
        { key: 'skillsText', fieldName: 'skillsText' },
    ];

    for (const field of textFields) {
        const value = profile[field.key];
        if (typeof value === 'string') {
            const result = validateTextInput(value, field.fieldName, { required: field.required });
            sanitizedData[field.key] = result.sanitizedValue;
            if (!result.isValid && result.error) {
                errors[field.key] = result.error;
            }
        } else {
            sanitizedData[field.key] = '';
        }
    }

    // Validate email
    if (typeof profile.email === 'string') {
        const emailResult = validateEmail(profile.email);
        sanitizedData.email = emailResult.sanitizedValue;
        if (!emailResult.isValid && emailResult.error) {
            errors.email = emailResult.error;
        }
    }

    // Validate phone
    if (typeof profile.phone === 'string') {
        const phoneResult = validatePhone(profile.phone);
        sanitizedData.phone = phoneResult.sanitizedValue;
        if (!phoneResult.isValid && phoneResult.error) {
            errors.phone = phoneResult.error;
        }
    }

    // Validate URLs
    if (typeof profile.linkedIn === 'string') {
        const urlResult = validateURL(profile.linkedIn, 'linkedIn');
        sanitizedData.linkedIn = urlResult.sanitizedValue;
        if (!urlResult.isValid && urlResult.error) {
            errors.linkedIn = urlResult.error;
        }
    }

    if (typeof profile.portfolio === 'string') {
        const urlResult = validateURL(profile.portfolio, 'portfolio');
        sanitizedData.portfolio = urlResult.sanitizedValue;
        if (!urlResult.isValid && urlResult.error) {
            errors.portfolio = urlResult.error;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        data: sanitizedData,
    };
}

// ============================================================================
// Rate Limiting Helper (for frontend)
// ============================================================================

const inputTimestamps: Map<string, number[]> = new Map();

/**
 * Checks if input rate is within limits (prevent rapid-fire submissions)
 */
export function checkInputRate(fieldId: string, maxInputsPerMinute: number = 60): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const timestamps = inputTimestamps.get(fieldId) || [];
    const recentTimestamps = timestamps.filter(t => t > oneMinuteAgo);

    if (recentTimestamps.length >= maxInputsPerMinute) {
        return false; // Rate limit exceeded
    }

    recentTimestamps.push(now);
    inputTimestamps.set(fieldId, recentTimestamps);

    return true;
}

/**
 * Clears rate limit tracking for a field
 */
export function clearRateLimit(fieldId: string): void {
    inputTimestamps.delete(fieldId);
}

<?php

declare(strict_types=1);

namespace App\Services;

/**
 * Validation Service
 * Provides reusable validation logic for forms
 * 
 * @package App\Services
 */
class ValidationService
{
    /** @var array<string, string> */
    private array $errors = [];

    /** @var array<string, mixed> */
    private array $data = [];

    /**
     * Validate data against rules
     * 
     * @param array<string, mixed> $data
     * @param array<string, array<string>> $rules
     * @return bool
     */
    public function validate(array $data, array $rules): bool
    {
        $this->data = $data;
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            foreach ($fieldRules as $rule) {
                $this->applyRule($field, $rule);
            }
        }

        return empty($this->errors);
    }

    /**
     * Apply a single rule to a field
     */
    private function applyRule(string $field, string $rule): void
    {
        $value = $this->data[$field] ?? null;
        $params = [];

        // Parse rule with parameters (e.g., "min:3", "max:255")
        if (str_contains($rule, ':')) {
            [$rule, $paramString] = explode(':', $rule, 2);
            $params = explode(',', $paramString);
        }

        $method = 'validate' . ucfirst($rule);
        if (method_exists($this, $method)) {
            $this->$method($field, $value, $params);
        }
    }

    /**
     * Get validation errors
     * 
     * @return array<string, string>
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Get first error message
     */
    public function firstError(): ?string
    {
        return !empty($this->errors) ? array_values($this->errors)[0] : null;
    }

    /**
     * Check if validation failed
     */
    public function fails(): bool
    {
        return !empty($this->errors);
    }

    // ==================== VALIDATION RULES ====================

    /**
     * Required field
     */
    private function validateRequired(string $field, mixed $value, array $params): void
    {
        if ($value === null || $value === '' || (is_array($value) && empty($value))) {
            $this->errors[$field] = $this->getFieldLabel($field) . ' không được để trống';
        }
    }

    /**
     * Email format
     */
    private function validateEmail(string $field, mixed $value, array $params): void
    {
        if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Email không hợp lệ';
        }
    }

    /**
     * Minimum length
     */
    private function validateMin(string $field, mixed $value, array $params): void
    {
        $min = (int) ($params[0] ?? 0);
        if (!empty($value) && strlen($value) < $min) {
            $this->errors[$field] = $this->getFieldLabel($field) . " phải có ít nhất {$min} ký tự";
        }
    }

    /**
     * Maximum length
     */
    private function validateMax(string $field, mixed $value, array $params): void
    {
        $max = (int) ($params[0] ?? 255);
        if (!empty($value) && strlen($value) > $max) {
            $this->errors[$field] = $this->getFieldLabel($field) . " không được quá {$max} ký tự";
        }
    }

    /**
     * Numeric value
     */
    private function validateNumeric(string $field, mixed $value, array $params): void
    {
        if (!empty($value) && !is_numeric($value)) {
            $this->errors[$field] = $this->getFieldLabel($field) . ' phải là số';
        }
    }

    /**
     * Minimum numeric value
     */
    private function validateMinValue(string $field, mixed $value, array $params): void
    {
        $min = (float) ($params[0] ?? 0);
        if (!empty($value) && is_numeric($value) && $value < $min) {
            $this->errors[$field] = $this->getFieldLabel($field) . " phải lớn hơn hoặc bằng {$min}";
        }
    }

    /**
     * Confirm field matches another
     */
    private function validateConfirmed(string $field, mixed $value, array $params): void
    {
        $confirmField = $field . '_confirmation';
        $confirmValue = $this->data[$confirmField] ?? null;

        if ($value !== $confirmValue) {
            $this->errors[$field] = 'Xác nhận ' . strtolower($this->getFieldLabel($field)) . ' không khớp';
        }
    }

    /**
     * Value must be in list
     */
    private function validateIn(string $field, mixed $value, array $params): void
    {
        if (!empty($value) && !in_array($value, $params)) {
            $this->errors[$field] = $this->getFieldLabel($field) . ' không hợp lệ';
        }
    }

    /**
     * Phone number format (Vietnam)
     */
    private function validatePhone(string $field, mixed $value, array $params): void
    {
        if (!empty($value) && !preg_match('/^(0|\+84)[0-9]{9,10}$/', $value)) {
            $this->errors[$field] = 'Số điện thoại không hợp lệ';
        }
    }

    // ==================== HELPERS ====================

    /**
     * Get human-readable field label
     */
    private function getFieldLabel(string $field): string
    {
        $labels = [
            'name' => 'Tên',
            'full_name' => 'Họ tên',
            'email' => 'Email',
            'password' => 'Mật khẩu',
            'phone' => 'Số điện thoại',
            'phone_number' => 'Số điện thoại',
            'address' => 'Địa chỉ',
            'price' => 'Giá',
            'quantity' => 'Số lượng',
            'category_id' => 'Danh mục',
            'description' => 'Mô tả',
        ];

        return $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
    }

    /**
     * Validate with custom error messages
     * 
     * @param array<string, mixed> $data
     * @param array<string, array<string>> $rules
     * @param array<string, string> $messages Custom messages
     * @return bool
     */
    public function validateWithMessages(array $data, array $rules, array $messages = []): bool
    {
        $result = $this->validate($data, $rules);

        // Override with custom messages
        foreach ($messages as $key => $message) {
            if (isset($this->errors[$key])) {
                $this->errors[$key] = $message;
            }
        }

        return $result;
    }
}

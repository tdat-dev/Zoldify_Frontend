<?php

namespace App\Models;

use App\Core\Database;

/**
 * Base Model Class
 * Provides common CRUD operations for all models
 * 
 * @package App\Models
 */
abstract class BaseModel
{
    protected Database $db;

    /** @var string Table name - should be defined in child class */
    protected $table;

    /** @var string Primary key column name */
    protected string $primaryKey = 'id';

    /** @var array<string> Columns that can be mass-assigned */
    protected array $fillable = [];

    /** @var array<string> Columns to hide from output */
    protected array $hidden = ['password'];

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Find a record by ID
     * 
     * @param int $id
     * @return array<string, mixed>|null
     */
    public function find(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = ?";
        $result = $this->db->fetchOne($sql, [$id]);
        return $result ? $this->hideFields($result) : null;
    }

    /**
     * Get all records
     * 
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $sql = "SELECT * FROM {$this->table}";
        $results = $this->db->fetchAll($sql);
        return array_map(fn($row) => $this->hideFields($row), $results);
    }

    /**
     * Get records with pagination
     * 
     * @param int $limit
     * @param int $offset
     * @return array<int, array<string, mixed>>
     */
    public function paginate(int $limit = 20, int $offset = 0): array
    {
        $sql = "SELECT * FROM {$this->table} ORDER BY {$this->primaryKey} DESC LIMIT ? OFFSET ?";
        $results = $this->db->fetchAll($sql, [$limit, $offset]);
        return array_map(fn($row) => $this->hideFields($row), $results);
    }

    /**
     * Create a new record
     * 
     * @param array<string, mixed> $data
     * @return int Last insert ID
     */
    public function create(array $data): int
    {
        $filtered = $this->filterFillable($data);

        if (empty($filtered)) {
            throw new \InvalidArgumentException("No fillable data provided");
        }

        // Wrap column names in backticks to handle MySQL reserved words (e.g., 'condition')
        $columns = implode(', ', array_map(fn($col) => "`{$col}`", array_keys($filtered)));
        $placeholders = implode(', ', array_fill(0, count($filtered), '?'));

        $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
        return $this->db->insert($sql, array_values($filtered));
    }

    /**
     * Update a record by ID
     * 
     * @param int $id
     * @param array<string, mixed> $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $filtered = $this->filterFillable($data);

        if (empty($filtered)) {
            return false;
        }

        // Wrap column names in backticks to handle MySQL reserved words
        $setParts = array_map(fn($col) => "`{$col}` = ?", array_keys($filtered));
        $setClause = implode(', ', $setParts);

        $sql = "UPDATE {$this->table} SET {$setClause} WHERE {$this->primaryKey} = ?";
        $params = array_merge(array_values($filtered), [$id]);

        return $this->db->execute($sql, $params) > 0;
    }

    /**
     * Delete a record by ID
     * 
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $sql = "DELETE FROM {$this->table} WHERE {$this->primaryKey} = ?";
        return $this->db->execute($sql, [$id]) > 0;
    }

    /**
     * Count total records
     * 
     * @return int
     */
    public function count(): int
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $result = $this->db->fetchOne($sql);
        return (int) ($result['total'] ?? 0);
    }

    /**
     * Find records by column value
     * 
     * @param string $column
     * @param mixed $value
     * @return array<int, array<string, mixed>>
     */
    public function findBy(string $column, mixed $value): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ?";
        $results = $this->db->fetchAll($sql, [$value]);
        return array_map(fn($row) => $this->hideFields($row), $results);
    }

    /**
     * Find first record by column value
     * 
     * @param string $column
     * @param mixed $value
     * @return array<string, mixed>|null
     */
    public function findOneBy(string $column, mixed $value): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$column} = ? LIMIT 1";
        $result = $this->db->fetchOne($sql, [$value]);
        return $result ? $this->hideFields($result) : null;
    }

    /**
     * Check if record exists
     * 
     * @param int $id
     * @return bool
     */
    public function exists(int $id): bool
    {
        $sql = "SELECT 1 FROM {$this->table} WHERE {$this->primaryKey} = ? LIMIT 1";
        return $this->db->fetchOne($sql, [$id]) !== null;
    }

    /**
     * Filter data to only include fillable fields
     * 
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function filterFillable(array $data): array
    {
        if (empty($this->fillable)) {
            return $data;
        }
        return array_intersect_key($data, array_flip($this->fillable));
    }

    /**
     * Remove hidden fields from result
     * 
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    protected function hideFields(array $data): array
    {
        foreach ($this->hidden as $field) {
            unset($data[$field]);
        }
        return $data;
    }

    /**
     * Get the table name
     */
    public function getTable(): string
    {
        return $this->table;
    }
}
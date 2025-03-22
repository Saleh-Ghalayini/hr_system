<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'course_name',
        'description',
        'skills',
        'duration_hours',
        'certificate_text'
    ];
    protected $casts = [
        'skills' => 'array'
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'course_id');
    }
}

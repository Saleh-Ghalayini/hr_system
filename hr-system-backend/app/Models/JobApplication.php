<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = ['status', 'interview_date', 'notes'];

    // Relationship to candidate
    public function candidate()
    {
        return $this->belongsTo(Candidate::class, 'candidate_id');
    }

    // Relationship to job opening
    public function jobOpening()
    {
        return $this->belongsTo(JobOpening::class, 'job_opening_id');
    }
}

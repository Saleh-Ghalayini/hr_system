<?php

namespace App\Http\Requests\Job;

use App\Http\Requests\BaseFormRequest;

class CandidateRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $isPost      = $this->isMethod('POST');
        $required    = $isPost ? 'required' : 'sometimes';
        $candidateId = $this->route('candidate')?->id;

        $emailUnique = $isPost
            ? 'required|email|unique:candidates,email|max:255'
            : "sometimes|email|unique:candidates,email,{$candidateId}|max:255";

        return [
            'name'        => "{$required}|string|max:255",
            'email'       => $emailUnique,
            'phone'       => "{$required}|string|max:20",
            'resume_path' => 'nullable|string|max:500',
        ];
    }
}

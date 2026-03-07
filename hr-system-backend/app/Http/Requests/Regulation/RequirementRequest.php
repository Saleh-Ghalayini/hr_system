<?php

namespace App\Http\Requests\Regulation;

use App\Http\Requests\BaseFormRequest;

class RequirementRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'requirement'       => "{$required}|string",
            'responsible_party' => 'nullable|exists:users,id',
            'deadline'          => 'nullable|date',
            'status'            => 'sometimes|in:pending,in_progress,completed',
        ];
    }
}

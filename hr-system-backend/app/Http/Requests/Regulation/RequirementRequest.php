<?php

namespace App\Http\Requests\Regulation;

use App\Http\Requests\BaseFormRequest;

class RequirementRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'description'       => "{$required}|string",
            'responsible_party' => 'nullable|exists:users,id',
            'due_date'          => 'nullable|date',
            'status'            => 'sometimes|in:pending,in_progress,completed',
        ];
    }
}

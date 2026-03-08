<?php

namespace App\Http\Requests\Task;

use App\Http\Requests\BaseFormRequest;

class TaskRequest extends BaseFormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'title'       => "{$required}|string|max:255",
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'project_id'  => 'nullable|exists:projects,id',
            'priority'    => 'sometimes|in:low,medium,high',
            'status'      => 'sometimes|in:todo,in_progress,blocked,done',
            'due_date'    => 'nullable|date',
        ];
    }
}

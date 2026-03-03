<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\TaskActivityLog;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function updated(Task $task): void
    {
        $userId = Auth::id();
        $dirty = $task->getDirty();
        $original = $task->getOriginal();

        $trackFields = ['status', 'assigned_to', 'priority', 'title', 'due_date'];

        foreach ($trackFields as $field) {
            if (array_key_exists($field, $dirty)) {
                TaskActivityLog::create([
                    'task_id'   => $task->id,
                    'user_id'   => $userId,
                    'action'    => 'updated',
                    'field'     => $field,
                    'old_value' => $original[$field] ?? null,
                    'new_value' => $dirty[$field],
                ]);
            }
        }
    }

    public function created(Task $task): void
    {
        TaskActivityLog::create([
            'task_id'   => $task->id,
            'user_id'   => Auth::id(),
            'action'    => 'created',
            'field'     => null,
            'old_value' => null,
            'new_value' => null,
        ]);
    }

    public function deleted(Task $task): void
    {
        TaskActivityLog::create([
            'task_id'   => $task->id,
            'user_id'   => Auth::id(),
            'action'    => 'deleted',
            'field'     => null,
            'old_value' => null,
            'new_value' => null,
        ]);
    }
}

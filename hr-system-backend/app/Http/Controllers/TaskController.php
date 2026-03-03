<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $tasks = Task::with([
            'assignedTo:id,first_name,last_name',
            'createdBy:id,first_name,last_name',
            'project:id,name',
        ])->orderByDesc('created_at')->get();

        return $this->success($tasks);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'project_id'  => 'nullable|exists:projects,id',
            'priority'    => 'sometimes|in:low,medium,high',
            'status'      => 'sometimes|in:todo,in_progress,done',
            'due_date'    => 'nullable|date',
        ]);

        $data['created_by'] = Auth::id();
        $task = Task::create($data);
        $task->load('assignedTo:id,first_name,last_name', 'project:id,name');

        return $this->created($task, 'Task created successfully.');
    }

    public function show(Task $task)
    {
        $task->load([
            'assignedTo:id,first_name,last_name',
            'createdBy:id,first_name,last_name',
            'project:id,name',
        ]);

        return $this->success($task);
    }

    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'project_id'  => 'nullable|exists:projects,id',
            'priority'    => 'sometimes|in:low,medium,high',
            'status'      => 'sometimes|in:todo,in_progress,done',
            'due_date'    => 'nullable|date',
        ]);

        $task->update($data);

        return $this->success($task, 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return $this->success(null, 'Task deleted successfully.');
    }

    public function activityLog(Task $task)
    {
        $logs = $task->activityLogs()
            ->with('user:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($logs);
    }
}

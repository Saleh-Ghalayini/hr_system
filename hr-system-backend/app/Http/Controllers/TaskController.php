<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Traits\ApiResponse;
use App\Http\Requests\Task\TaskRequest;
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

    public function store(TaskRequest $request)
    {
        $data               = $request->validated();
        $data['created_by'] = Auth::id();
        $task               = Task::create($data);
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

    public function update(TaskRequest $request, Task $task)
    {
        if (Auth::user()->role !== 'admin' && $task->created_by !== Auth::id()) {
            return $this->forbidden('You can only update tasks you created.');
        }

        $task->update($request->validated());

        return $this->success($task, 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        if (Auth::user()->role !== 'admin' && $task->created_by !== Auth::id()) {
            return $this->forbidden('You can only delete tasks you created.');
        }

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

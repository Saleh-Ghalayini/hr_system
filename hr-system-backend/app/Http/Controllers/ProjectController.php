<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $projects = Project::withCount('tasks')
            ->with('creator:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get();

        return $this->success($projects);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:active,on_hold,completed,cancelled',
        ]);

        $data['created_by'] = Auth::id();
        $project = Project::create($data);

        return $this->created($project, 'Project created successfully.');
    }

    public function show(Project $project)
    {
        $project->load([
            'creator:id,first_name,last_name',
            'tasks.assignedTo:id,first_name,last_name',
        ]);

        return $this->success($project);
    }

    public function update(Request $request, Project $project)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:active,on_hold,completed,cancelled',
        ]);

        $project->update($data);

        return $this->success($project, 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return $this->success(null, 'Project deleted successfully.');
    }
}

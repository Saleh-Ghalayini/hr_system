<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Traits\ApiResponse;
use App\Http\Requests\Project\ProjectRequest;
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

    public function store(ProjectRequest $request)
    {
        $data               = $request->validated();
        $data['created_by'] = Auth::id();
        $project            = Project::create($data);

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

    public function update(ProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        return $this->success($project, 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return $this->success(null, 'Project deleted successfully.');
    }
}

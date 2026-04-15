<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use Tests\TestCase;

class TrainingTest extends TestCase
{
    private function createCourse(array $overrides = []): Course
    {
        return Course::create(array_merge([
            'course_name' => 'Course ' . uniqid(),
            'description' => 'Course description',
            'skills' => ['communication'],
            'duration_hours' => 12,
            'certificate_text' => 'Certificate of Completion',
        ], $overrides));
    }

    public function test_admin_can_create_course(): void
    {
        $admin = $this->createUser(['role' => 'admin']);

        $payload = [
            'course_name' => 'Conflict Management',
            'description' => 'Practical conflict management basics',
            'skills' => ['negotiation', 'communication'],
            'duration_hours' => 8,
            'certificate_text' => 'Certificate - Conflict Management',
        ];

        $response = $this->actingAsJwt($admin)
            ->postJson('/api/v1/admin/courses', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.course_name', 'Conflict Management');

        $this->assertDatabaseHas('courses', ['course_name' => 'Conflict Management']);
    }

    public function test_manager_cannot_access_admin_training_endpoints(): void
    {
        $manager = $this->createUser(['role' => 'manager']);

        $coursesResponse = $this->actingAsJwt($manager)
            ->getJson('/api/v1/admin/courses');

        $enrollmentsResponse = $this->actingAsJwt($manager)
            ->getJson('/api/v1/admin/enrollments');

        $coursesResponse->assertStatus(403);
        $enrollmentsResponse->assertStatus(403);
    }

    public function test_duplicate_active_enrollment_is_rejected(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-31',
            'status' => 'enrolled',
        ]);

        $response = $this->actingAsJwt($admin)->postJson('/api/v1/admin/enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-28',
            'status' => 'in_progress',
        ]);

        $response->assertStatus(400);
    }

    public function test_can_reenroll_after_completed_enrollment(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-31',
            'status' => 'completed',
        ]);

        $response = $this->actingAsJwt($admin)->postJson('/api/v1/admin/enrollments', [
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-31',
            'status' => 'enrolled',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);
    }

    public function test_update_end_date_cannot_be_before_existing_start_date(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-04-10',
            'end_date' => '2026-04-30',
            'status' => 'in_progress',
        ]);

        $response = $this->actingAsJwt($admin)
            ->putJson("/api/v1/admin/enrollments/{$enrollment->id}", [
                'end_date' => '2026-04-01',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.end_date', fn($value) => !empty($value));
    }

    public function test_update_end_date_after_existing_start_date_is_allowed(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-04-10',
            'end_date' => '2026-04-30',
            'status' => 'in_progress',
        ]);

        $response = $this->actingAsJwt($admin)
            ->putJson("/api/v1/admin/enrollments/{$enrollment->id}", [
                'end_date' => '2026-05-05',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.end_date', '2026-05-05');
    }

    public function test_course_deletion_is_blocked_when_enrollments_exist(): void
    {
        $admin = $this->createUser(['role' => 'admin']);
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-01-31',
            'status' => 'enrolled',
        ]);

        $response = $this->actingAsJwt($admin)
            ->deleteJson("/api/v1/admin/courses/{$course->id}");

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Cannot delete a course that has enrollments.');
    }

    public function test_user_can_get_own_enrollments_with_date_only_format(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-20',
            'status' => 'completed',
        ]);

        $response = $this->actingAsJwt($user)
            ->getJson('/api/v1/enrollments/my');

        $response->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.enrollments.0.start_date', '2026-06-01')
            ->assertJsonPath('data.enrollments.0.end_date', '2026-06-20')
            ->assertJsonPath('data.enrollments.0.certificate_eligible', true);
    }

    public function test_user_can_get_own_enrollments_with_progress_and_certificate_flags(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse(['course_name' => 'Secure Coding Basics']);

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-02-01',
            'end_date' => '2026-03-01',
            'status' => 'completed',
        ]);

        $response = $this->actingAsJwt($user)
            ->getJson('/api/v1/enrollments/my');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.enrollments.0.course_name', 'Secure Coding Basics')
            ->assertJsonPath('data.enrollments.0.progress', 100)
            ->assertJsonPath('data.enrollments.0.certificate_eligible', true);
    }

    public function test_user_only_sees_own_enrollments_on_my_endpoint(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $otherUser = $this->createUser(['role' => 'user']);
        $firstCourse = $this->createCourse(['course_name' => 'Team Communication']);
        $secondCourse = $this->createCourse(['course_name' => 'Data Security 101']);

        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $firstCourse->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'in_progress',
        ]);

        Enrollment::create([
            'user_id' => $otherUser->id,
            'course_id' => $secondCourse->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'completed',
        ]);

        $response = $this->actingAsJwt($user)
            ->getJson('/api/v1/enrollments/my');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', 1)
            ->assertJsonMissingPath('data.enrollments.1')
            ->assertJsonPath('data.enrollments.0.course_name', 'Team Communication');
    }

    public function test_user_can_update_own_enrollment_progress(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'in_progress',
            'progress_percentage' => 30,
        ]);

        $response = $this->actingAsJwt($user)
            ->patchJson("/api/v1/enrollments/{$enrollment->id}/progress", [
                'progress_percentage' => 70,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.progress', 70)
            ->assertJsonPath('data.progress_percentage', 70);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'progress_percentage' => 70,
        ]);
    }

    public function test_user_cannot_update_other_user_enrollment_progress(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $otherUser = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $otherUser->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'in_progress',
            'progress_percentage' => 25,
        ]);

        $response = $this->actingAsJwt($user)
            ->patchJson("/api/v1/enrollments/{$enrollment->id}/progress", [
                'progress_percentage' => 60,
            ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_update_progress_for_completed_enrollment(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'completed',
            'progress_percentage' => 100,
        ]);

        $response = $this->actingAsJwt($user)
            ->patchJson("/api/v1/enrollments/{$enrollment->id}/progress", [
                'progress_percentage' => 90,
            ]);

        $response->assertStatus(400);
    }

    public function test_progress_update_moves_enrolled_status_to_in_progress(): void
    {
        $user = $this->createUser(['role' => 'user']);
        $course = $this->createCourse();

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'start_date' => '2026-01-10',
            'end_date' => '2026-02-10',
            'status' => 'enrolled',
            'progress_percentage' => 0,
        ]);

        $response = $this->actingAsJwt($user)
            ->patchJson("/api/v1/enrollments/{$enrollment->id}/progress", [
                'progress_percentage' => 10,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.progress', 10);

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'in_progress',
            'progress_percentage' => 10,
        ]);
    }
}

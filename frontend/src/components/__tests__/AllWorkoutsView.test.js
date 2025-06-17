import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AllWorkoutsView from '../AllWorkoutsView.vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock auth store
vi.mock('../../stores/auth')
const mockAuthStore = {
  token: 'mock-token',
}
vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/edit/:id',
      name: 'EditWorkoutWithWeights',
      component: { template: '<div>Edit</div>' },
    },
  ],
})

describe('AllWorkoutsView', () => {
  let wrapper

  const mockWorkoutsData = [
    {
      id: 1,
      date: '2025-06-17T10:00:00.000Z',
      workout: {
        id: 1,
        name: 'Push Day',
        exercise: [
          {
            id: 1,
            name: 'Bankdrücken',
            targetMuscleGroup: 'Brust',
            equipment: 'Langhantel',
          },
        ],
      },
      weights: [{ reps: [10, 8, 6], weights: [80, 85, 90] }],
    },
    {
      id: 2,
      date: '2025-06-16T10:00:00.000Z',
      workout: {
        id: 2,
        name: 'Pull Day',
        exercise: [
          {
            id: 3,
            name: 'Klimmzüge',
            targetMuscleGroup: 'Rücken',
            equipment: 'Körpergewicht',
          },
        ],
      },
      weights: [{ reps: [8, 6, 5], weights: [0, 0, 0] }],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: mockWorkoutsData })
  })

  const createWrapper = () => {
    return mount(AllWorkoutsView, {
      global: {
        plugins: [router],
        mocks: {
          $router: router,
          $route: { name: 'AllWorkouts' },
        },
      },
    })
  }

  describe('Workout Loading', () => {
    it('sollte Workouts beim Mount laden', async () => {
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workoutsWithWeights')
      expect(wrapper.vm.workouts).toEqual(mockWorkoutsData)
    })

    it('sollte "Keine Workouts gefunden" anzeigen wenn keine Workouts vorhanden sind', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(wrapper.find('.no-workouts').text()).toBe('Keine Workouts gefunden.')
    })

    it('sollte Fehler beim Laden behandeln', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(consoleSpy).toHaveBeenCalledWith(
        'AllWorkoutsView: Fehler beim Laden der Workouts:',
        expect.any(Error),
      )
      consoleSpy.mockRestore()
    })
  })

  describe('Date Filtering', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte das neueste Workout-Datum als Standard setzen', () => {
      expect(wrapper.vm.selectedDate).toBe('2025-06-17T10:00:00.000Z')
    })

    it('sollte Workouts nach Datum filtern', async () => {
      wrapper.vm.selectedDate = '2025-06-16'
      wrapper.vm.applyFilters()

      expect(wrapper.vm.filteredWorkouts).toHaveLength(1)
      expect(wrapper.vm.filteredWorkouts[0].workout.name).toBe('Pull Day')
    })

    it('sollte alle Workouts anzeigen wenn kein Datum ausgewählt ist', async () => {
      wrapper.vm.selectedDate = ''
      wrapper.vm.applyFilters()

      expect(wrapper.vm.filteredWorkouts).toHaveLength(2)
    })
  })

  describe('Workout Actions', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    describe('Delete Workout', () => {
      it('sollte ein Workout erfolgreich löschen', async () => {
        const workoutToDelete = mockWorkoutsData[0]
        mockedAxios.get.mockResolvedValue({ data: workoutToDelete })
        mockedAxios.delete.mockResolvedValue({ data: {} })

        await wrapper.vm.deleteWorkout(1)

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workoutWithWeights/1')
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          'http://localhost:8080/workoutWithWeights/1',
        )
        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8080/workout/1')
      })
    })

    describe('Duplicate Workout', () => {
      it('sollte ein Workout erfolgreich duplizieren', async () => {
        const workoutToDuplicate = mockWorkoutsData[0]
        mockedAxios.get.mockResolvedValue({ data: workoutToDuplicate })
        mockedAxios.post.mockResolvedValueOnce({ data: { id: 3, name: 'Push Day' } })
        mockedAxios.post.mockResolvedValueOnce({ data: {} })

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        await wrapper.vm.duplicateWorkout(1)

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workoutWithWeights/1')
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:8080/workout',
          expect.objectContaining({
            name: 'Push Day',
            exercise: expect.arrayContaining([
              expect.objectContaining({
                name: 'Bankdrücken',
                targetMuscleGroup: 'Brust',
              }),
            ]),
          }),
        )
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:8080/OneWorkout',
          expect.any(Object),
        )
        expect(alertSpy).toHaveBeenCalledWith('Workout erfolgreich dupliziert')

        alertSpy.mockRestore()
      })
    })
  })
})

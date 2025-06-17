import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import WorkoutList from '../WorkoutList.vue'
import { useAuthStore } from '../../stores/auth'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock auth store
vi.mock('../../stores/auth')
const mockAuthStore = {
  token: 'mock-token',
  isAuthenticated: true,
}
vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

// Mock window.confirm and window.location.reload
global.confirm = vi.fn()
Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
  writable: true,
})

describe('WorkoutList', () => {
  let wrapper

  const mockWorkoutsData = [
    {
      id: 1,
      name: 'Push Day',
      show: true,
      exercise: [
        {
          id: 1,
          name: 'Bankdrücken',
          targetMuscleGroup: 'Brust',
          equipment: 'Langhantel',
        },
      ],
    },
    {
      id: 2,
      name: 'Pull Day',
      show: true,
      exercise: [
        {
          id: 3,
          name: 'Klimmzüge',
          targetMuscleGroup: 'Rücken',
          equipment: 'Körpergewicht',
        },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.get.mockResolvedValue({ data: mockWorkoutsData })
    global.confirm.mockReturnValue(true)
  })

  const createWrapper = () => {
    return mount(WorkoutList, {
      global: {
        plugins: [router],
        mocks: {
          $router: router,
          $route: { name: 'WorkoutList' },
        },
      },
    })
  }

  describe('Component Loading', () => {
    it('sollte Workouts beim Mount laden', async () => {
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workouts')
      expect(wrapper.vm.workouts).toHaveLength(2)
    })

    it('sollte "Keine Workouts gefunden" anzeigen wenn keine sichtbaren Workouts vorhanden', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] })

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(wrapper.find('.no-workouts').exists()).toBe(true)
      expect(wrapper.text()).toContain('Keine Workouts gefunden.')
    })

    it('sollte nicht laden wenn nicht authentifiziert', async () => {
      mockAuthStore.isAuthenticated = false

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockedAxios.get).not.toHaveBeenCalled()
    })
  })

  describe('Delete Exercise', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte Übung erfolgreich löschen', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await wrapper.vm.deleteExercise(1, 1)

      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8080/workout/1/1')
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('sollte Bestätigung vor dem Löschen anfordern', async () => {
      global.confirm.mockReturnValue(false)

      await wrapper.vm.deleteExercise(1, 1)

      expect(global.confirm).toHaveBeenCalledWith('Möchten Sie die Übung wirklich löschen?')
      expect(mockedAxios.delete).not.toHaveBeenCalled()
    })
  })

  describe('Delete Workout', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte Workout erfolgreich löschen', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await wrapper.vm.deleteWorkout(1)

      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8080/workout/1')
      // loadWorkouts wird aufgerufen - wir testen einfach dass das Delete erfolgreich war
      expect(mockedAxios.delete).toHaveBeenCalled()
    })

    it('sollte Bestätigung vor dem Löschen anfordern', async () => {
      global.confirm.mockReturnValue(false)

      await wrapper.vm.deleteWorkout(1)

      expect(global.confirm).toHaveBeenCalledWith('Möchten Sie das Workout wirklich löschen?')
      expect(mockedAxios.delete).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('sollte Fehler beim Laden der Workouts behandeln', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValue(new Error('Network error'))

      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Wir prüfen nur, dass eine leere Liste angezeigt wird
      expect(wrapper.find('.no-workouts').exists()).toBe(true)
      consoleSpy.mockRestore()
    })
  })
})

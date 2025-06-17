import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import WorkoutChoice from '../WorkoutChoice.vue'
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
  routes: [
    { path: '/tracker/:id', name: 'Tracker', component: { template: '<div>Tracker</div>' } },
  ],
})

describe('WorkoutChoice', () => {
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
  })

  const createWrapper = () => {
    return mount(WorkoutChoice, {
      global: {
        plugins: [router],
        mocks: {
          $router: router,
          $route: { name: 'WorkoutChoice' },
        },
      },
    })
  }

  describe('Component Loading', () => {
    it('sollte Workouts beim Mount laden', async () => {
      wrapper = createWrapper()

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/workouts', {
        headers: {
          Authorization: `Bearer ${mockAuthStore.token}`,
        },
      })
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
  })

  describe('Basic Functionality', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    it('sollte Workout-Daten korrekt anzeigen', () => {
      expect(wrapper.vm.workouts).toHaveLength(2)
      expect(wrapper.vm.workouts[0].name).toBe('Push Day')
      expect(wrapper.vm.workouts[1].name).toBe('Pull Day')
    })
  })
})

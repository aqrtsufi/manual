<script setup lang="ts">
import { computed } from 'vue'
import {
  quranicOpenings,
  quranicOpeningsById,
  type QuranicOpeningId
} from '../data/quranicOpenings'
import {
  useOrbitClock,
  type OrbitMode,
  type OrbitTimezoneMode
} from '../composables/useOrbitClock'

const {
  settings,
  localTimezone,
  setMode,
  setTimezoneMode,
  setOtherTimezone,
  setSequencePosition,
  resetSequence
} = useOrbitClock()

type EditableSequence = 'preset1' | 'preset2' | 'custom'

const positions = [
  '12 o’clock',
  '1 o’clock',
  '2 o’clock',
  '3 o’clock',
  '4 o’clock',
  '5 o’clock',
  '6 o’clock',
  '7 o’clock',
  '8 o’clock',
  '9 o’clock',
  '10 o’clock',
  '11 o’clock'
]

const timezoneOptions = computed(() => {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[]
  }

  if (typeof intl.supportedValuesOf === 'function') {
    return intl.supportedValuesOf('timeZone')
  }

  return [
    'America/New_York',
    'America/Toronto',
    'Europe/London',
    'Europe/Paris',
    'Europe/Istanbul',
    'Indian/Mauritius',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Kolkata',
    'Asia/Kuala_Lumpur',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]
})

function updateMode(event: Event) {
  setMode((event.target as HTMLSelectElement).value as OrbitMode)
}

function updateTimezoneMode(event: Event) {
  setTimezoneMode(
    (event.target as HTMLSelectElement).value as OrbitTimezoneMode
  )
}

function updateOpening(
  sequence: EditableSequence,
  position: number,
  event: Event
) {
  setSequencePosition(
    sequence,
    position,
    (event.target as HTMLSelectElement).value as QuranicOpeningId
  )
}

function selectedSuras(id: QuranicOpeningId) {
  return quranicOpeningsById.get(id)?.suras.join(', ') || ''
}
</script>

<template>
  <section class="clock-settings-page page-enter">
    <header class="page-heading ornament-heading">
      <div>
        <span class="eyebrow">AQRT Manual</span>
        <h1>Clock settings</h1>
      </div>
    </header>

    <div class="clock-settings-intro">
      <p>
        Position 12 is the top of the orbit. The sequence then continues
        clockwise through positions 1 to 11.
      </p>
      <p>
        At 4 : 15 pm, the clock displays the combination at position 4,
        followed by the combination at position 3.
      </p>
    </div>

    <section class="clock-settings-card">
      <h2>Active arrangement</h2>

      <label class="clock-settings-field">
        <span>Arrangement</span>
        <select :value="settings.mode" @change="updateMode">
          <option value="preset1">Preset 1</option>
          <option value="preset2">Preset 2</option>
          <option value="custom">Custom</option>
        </select>
      </label>
    </section>

    <section class="clock-settings-card">
      <h2>Timezone</h2>

      <label class="clock-settings-field">
        <span>Time source</span>
        <select :value="settings.timezoneMode" @change="updateTimezoneMode">
          <option value="new-york">New York</option>
          <option value="local">
            Local device time — {{ localTimezone }}
          </option>
          <option value="other">Another timezone</option>
        </select>
      </label>

      <label
        v-if="settings.timezoneMode === 'other'"
        class="clock-settings-field"
      >
        <span>Timezone</span>

        <input
          :value="settings.otherTimezone"
          list="aqrt-timezones"
          autocomplete="off"
          @change="setOtherTimezone(($event.target as HTMLInputElement).value)"
        />

        <datalist id="aqrt-timezones">
          <option
            v-for="timezone in timezoneOptions"
            :key="timezone"
            :value="timezone"
          />
        </datalist>
      </label>
    </section>

    <section
      v-for="sequenceName in ([
        'preset1',
        'preset2',
        'custom'
      ] as EditableSequence[])"
      :key="sequenceName"
      class="clock-settings-card"
    >
      <div class="clock-settings-card-heading">
        <h2>
          {{
            sequenceName === 'preset1'
              ? 'Preset 1'
              : sequenceName === 'preset2'
                ? 'Preset 2'
                : 'Custom'
          }}
        </h2>

        <button
          type="button"
          class="outline-action"
          @click="resetSequence(sequenceName)"
        >
          Clear all
        </button>
      </div>

      <div class="orbit-position-editor">
        <label
          v-for="(positionLabel, index) in positions"
          :key="`${sequenceName}-${index}`"
          class="orbit-position-row"
        >
          <span class="orbit-position-number">
            {{ positionLabel }}
          </span>

          <select
            :value="settings[sequenceName][index]"
            @change="updateOpening(sequenceName, index, $event)"
          >
            <option
              v-for="opening in quranicOpenings"
              :key="opening.id"
              :value="opening.id"
            >
              {{
                opening.id === 'none'
                  ? 'None'
                  : `${opening.arabic} — ${opening.label}`
              }}
            </option>
          </select>

          <small>
            {{
              selectedSuras(settings[sequenceName][index])
                || 'No combination at this position'
            }}
          </small>
        </label>
      </div>
    </section>
  </section>
</template>

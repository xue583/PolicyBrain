import { computed, toValue, type MaybeRefOrGetter, type Ref } from 'vue'

/** 套餐选中逻辑：按 id 选中，失配时回退 featured 项，再回退首项 */
export function usePlanSelection<T extends { id: string; featured?: boolean }>(
  plans: MaybeRefOrGetter<T[]>,
  selectedId: Ref<string>,
) {
  const currentPlan = computed(() => {
    const list = toValue(plans)
    return (
      list.find((item) => item.id === selectedId.value) ??
      list.find((item) => item.featured) ??
      list[0]!
    )
  })

  const selectPlan = (id: string) => {
    selectedId.value = id
  }

  return { currentPlan, selectPlan }
}

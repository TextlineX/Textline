import { HomePage } from '../pages/home'

type AppRouterProps = {
  isBootComplete: boolean
}

export function AppRouter({ isBootComplete }: AppRouterProps) {
  return <HomePage isBootComplete={isBootComplete} />
}

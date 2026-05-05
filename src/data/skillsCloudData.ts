import type { SkillCloudIconKey } from './skillsIconMap'

export type SkillCloudGroup = 'frontend' | 'motion' | 'three' | 'backend' | 'tooling'

export type SkillCloudItem = {
  label: string
  group: SkillCloudGroup
  icon?: SkillCloudIconKey
  weight?: number
  priority?: number
}

export const skillsCloudItems: SkillCloudItem[] = [
  { label: 'React', group: 'frontend', icon: 'react', weight: 3, priority: 1 },
  { label: 'TypeScript', group: 'frontend', icon: 'typescript', weight: 3, priority: 2 },
  { label: 'Three.js', group: 'three', icon: 'three', weight: 3, priority: 3 },
  { label: 'Python', group: 'backend', icon: 'python', weight: 3, priority: 4 },
  { label: 'Vue', group: 'frontend', icon: 'vue', weight: 3, priority: 5 },
  { label: 'Go', group: 'backend', icon: 'go', weight: 2, priority: 6 },
  { label: 'Node.js', group: 'backend', icon: 'node', weight: 2, priority: 7 },
  { label: 'Flutter', group: 'frontend', icon: 'flutter', weight: 2, priority: 8 },
  { label: 'Dart', group: 'frontend', icon: 'dart', weight: 2, priority: 9 },
  { label: 'Electron', group: 'tooling', icon: 'electron', weight: 2, priority: 10 },
  { label: 'Matter.js', group: 'motion', icon: 'matter', weight: 2, priority: 11 },
  { label: 'Vite', group: 'tooling', icon: 'vite', weight: 2, priority: 12 },
  { label: 'Tailwind', group: 'frontend', icon: 'tailwind', weight: 2, priority: 13 },
  { label: 'Pinia', group: 'frontend', icon: 'pinia', weight: 1, priority: 14 },
  { label: 'Flask', group: 'backend', icon: 'flask', weight: 2, priority: 15 },
  { label: 'WebSocket', group: 'backend', icon: 'websocket', weight: 2, priority: 16 },
  { label: 'Docker', group: 'tooling', icon: 'docker', weight: 2, priority: 17 },
  { label: 'Playwright', group: 'tooling', icon: 'playwright', weight: 2, priority: 18 },
  { label: 'ROS2', group: 'backend', icon: 'ros2', weight: 1, priority: 19 },
  { label: 'Cloudflare', group: 'tooling', icon: 'cloudflare', weight: 1, priority: 20 },
  { label: 'Crawl4AI', group: 'tooling', icon: 'crawl4ai', weight: 1, priority: 21 },
  { label: 'Kotlin', group: 'frontend', icon: 'kotlin', weight: 1, priority: 22 },
  { label: 'GSAP', group: 'motion', icon: 'gsap', weight: 1, priority: 23 },
  { label: 'WebGL', group: 'three', icon: 'webgl', weight: 2, priority: 24 },
  { label: 'Canvas', group: 'motion', icon: 'canvas', weight: 1, priority: 25 },
  { label: 'Shader', group: 'three', icon: 'shader', weight: 1, priority: 26 },
  { label: 'Less', group: 'frontend', icon: 'less', weight: 1, priority: 27 },
  { label: 'Git', group: 'tooling', icon: 'git', weight: 1, priority: 28 },
]

import {
  siCanvas,
  siCloudflare,
  siDart,
  siDocker,
  siElectron,
  siFlask,
  siFlutter,
  siGit,
  siGo,
  siGsap,
  siKotlin,
  siLess,
  siMatterdotjs,
  siNodedotjs,
  siOpengl,
  siPinia,
  siPython,
  siReact,
  siRos,
  siSocket,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVite,
  siVuedotjs,
  siWebgl,
} from 'simple-icons'

export type SkillCloudIconKey =
  | 'react'
  | 'typescript'
  | 'three'
  | 'python'
  | 'vue'
  | 'go'
  | 'node'
  | 'flutter'
  | 'dart'
  | 'electron'
  | 'matter'
  | 'vite'
  | 'tailwind'
  | 'pinia'
  | 'flask'
  | 'websocket'
  | 'docker'
  | 'playwright'
  | 'ros2'
  | 'cloudflare'
  | 'crawl4ai'
  | 'kotlin'
  | 'gsap'
  | 'webgl'
  | 'canvas'
  | 'shader'
  | 'less'
  | 'git'

type SkillCloudIconDefinition = {
  mark?: string
  path?: string
  viewBox?: string
}

const defaultViewBox = '0 0 24 24'

export const skillsIconMap: Record<SkillCloudIconKey, SkillCloudIconDefinition> = {
  react: { path: siReact.path, viewBox: defaultViewBox },
  typescript: { path: siTypescript.path, viewBox: defaultViewBox },
  three: { path: siThreedotjs.path, viewBox: defaultViewBox },
  python: { path: siPython.path, viewBox: defaultViewBox },
  vue: { path: siVuedotjs.path, viewBox: defaultViewBox },
  go: { path: siGo.path, viewBox: defaultViewBox },
  node: { path: siNodedotjs.path, viewBox: defaultViewBox },
  flutter: { path: siFlutter.path, viewBox: defaultViewBox },
  dart: { path: siDart.path, viewBox: defaultViewBox },
  electron: { path: siElectron.path, viewBox: defaultViewBox },
  matter: { path: siMatterdotjs.path, viewBox: defaultViewBox },
  vite: { path: siVite.path, viewBox: defaultViewBox },
  tailwind: { path: siTailwindcss.path, viewBox: defaultViewBox },
  pinia: { path: siPinia.path, viewBox: defaultViewBox },
  flask: { path: siFlask.path, viewBox: defaultViewBox },
  websocket: { path: siSocket.path, viewBox: defaultViewBox },
  docker: { path: siDocker.path, viewBox: defaultViewBox },
  playwright: { mark: 'PW' },
  ros2: { path: siRos.path, viewBox: defaultViewBox },
  cloudflare: { path: siCloudflare.path, viewBox: defaultViewBox },
  crawl4ai: { mark: 'C4' },
  kotlin: { path: siKotlin.path, viewBox: defaultViewBox },
  gsap: { path: siGsap.path, viewBox: defaultViewBox },
  webgl: { path: siWebgl.path, viewBox: defaultViewBox },
  canvas: { path: siCanvas.path, viewBox: defaultViewBox },
  shader: { path: siOpengl.path, viewBox: defaultViewBox },
  less: { path: siLess.path, viewBox: defaultViewBox },
  git: { path: siGit.path, viewBox: defaultViewBox },
}

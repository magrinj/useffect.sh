export interface Member {
  id: string
  name: string
  role: string
  /** Public-folder path. `undefined` for the Robots easter egg. */
  image?: string
  /** npm scope handle for the package.json pseudo-snippet. */
  scope: string
}

export const members: readonly Member[] = [
  {
    id: '001',
    name: 'David Leuliette',
    role: 'Architect Engineer',
    image: '/david.png',
    scope: '@useffect/david',
  },
  {
    id: '006',
    name: 'Gabriel Hofman',
    role: 'Architect Engineer',
    image: '/gabriel.png',
    scope: '@useffect/gabriel',
  },
  {
    id: '002',
    name: 'Jérémy Magrin',
    role: 'Architect Engineer',
    image: '/jeremy.png',
    scope: '@useffect/jeremy',
  },
  {
    id: '005',
    name: 'Ludwig Vantours',
    role: 'Architect Engineer',
    image: '/ludwig.png',
    scope: '@useffect/ludwig',
  },
  {
    id: '004',
    name: 'Matthys Ducrocq',
    role: 'Architect Engineer',
    image: '/matthys.png',
    scope: '@useffect/matthys',
  },
  {
    id: '003',
    name: 'Pablo Giraud-Carrier',
    role: 'Architect Engineer',
    image: '/pablo.png',
    scope: '@useffect/pablo',
  },
] as const

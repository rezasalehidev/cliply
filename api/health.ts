import type { IncomingMessage, ServerResponse } from 'node:http'

type Res = ServerResponse & {
  status: (code: number) => Res
  json: (body: unknown) => void
}

export default function handler(_req: IncomingMessage, res: Res) {
  res.status(200).json({ ok: true, service: 'cliply-api', runtime: 'vercel' })
}

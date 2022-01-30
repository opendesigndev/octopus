import { convertAll } from './utils/convert-all'

(async () => {
  await convertAll({
    render: Boolean(Number(process.env.CONVERT_RENDER))
  })
})()
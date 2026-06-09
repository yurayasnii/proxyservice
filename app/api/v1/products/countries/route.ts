import { connectDB } from '@/lib/db/connect'
import ProxyProduct from '@/lib/models/ProxyProduct'
import { ok, serverError } from '@/lib/utils/response'

export async function GET() {
  try {
    await connectDB()
    const countries = await ProxyProduct.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$countryCode',
          countryName: { $first: '$countryName' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    return ok(countries.map((c) => ({
      code: c._id,
      name: c.countryName,
      count: c.count,
    })))
  } catch (err) {
    return serverError(err)
  }
}

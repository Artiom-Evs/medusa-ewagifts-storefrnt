import { externalLoginCallback } from "@lib/data/external-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { searchParams } = new URL(req.url)
    const query = Object.fromEntries(searchParams.entries())

    await externalLoginCallback(params.provider, query)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/account`)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(error, { status: 500 })
  }
}

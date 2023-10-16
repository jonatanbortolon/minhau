import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

export async function POST() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

export async function PATCH() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

export async function HEAD() {
  return NextResponse.json({
    success: false,
    payload: {
      message: 'Route not found',
    },
  })
}

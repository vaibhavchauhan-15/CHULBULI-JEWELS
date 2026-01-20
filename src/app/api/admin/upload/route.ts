import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/middleware'
import { uploadImage } from '@/lib/cloudinary'
import { SECURITY_CONFIG } from '@/lib/config'

async function handlePOST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Validate number of files
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed per upload' },
        { status: 400 }
      )
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds maximum size of 5MB` },
          { status: 400 }
        )
      }

      // Check file type
      const allowedTypes = [...SECURITY_CONFIG.ALLOWED_IMAGE_TYPES] as string[]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { 
            error: `Invalid file type for "${file.name}". Allowed types: JPEG, PNG, WebP`,
            allowedTypes: allowedTypes,
          },
          { status: 400 }
        )
      }
    }

    const uploadPromises = files.map(async (file) => {
      // Convert File to Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Upload to Cloudinary with security options
      const result = await uploadImage(buffer, 'chulbuli-jewels/products')
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.url
    })

    const imageUrls = await Promise.all(uploadPromises)

    return NextResponse.json({ 
      success: true,
      urls: imageUrls,
      count: imageUrls.length,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

export const POST = authMiddleware(handlePOST)

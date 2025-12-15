import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { id: idStr } = await context.params
  const id = Number(idStr);

  // Parse FormData
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const displayOrder = Number(formData.get('displayOrder'));
  const isActive = formData.get('isActive') === 'true';
  const imageFile = formData.get('image') as File | null;

  let imageData, imageName, imageType, imageSize;
  if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
    imageData = Buffer.from(await imageFile.arrayBuffer());
    imageName = imageFile.name;
    imageType = imageFile.type;
    imageSize = imageFile.size;
  }

  try {
    const updated = await prisma.tourCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        displayOrder,
        isActive,
        ...(imageData && {
          imageData,
          imageName,
          imageType,
          imageSize,
        }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id: idStr } = await context.params
  const id = Number(idStr);
  try {
    const deleted = await prisma.tourCategory.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category. It may be in use.' }, { status: 400 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  // Parse FormData
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const displayOrder = Number(formData.get('displayOrder'));
  const isActive = formData.get('isActive') === 'true';
  const imageFile = formData.get('image');

  let imageData, imageName, imageType, imageSize;
  if (imageFile && imageFile instanceof Blob) {
    imageData = Buffer.from(await imageFile.arrayBuffer());
    imageName = (imageFile as any).name;
    imageType = imageFile.type;
    imageSize = (imageFile as any).size;
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  try {
    const deleted = await prisma.tourCategory.delete({
      where: { id },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category. It may be in use.' }, { status: 400 });
  }
} 
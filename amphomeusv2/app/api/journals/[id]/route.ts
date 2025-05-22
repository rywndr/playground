import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { MediaType } from '@/prisma/app/generated/prisma';

// GET a specific journal by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        { error: 'Journal ID is required' },
        { status: 400 }
      );
    }
    
    const journalId = resolvedParams.id;
    
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
      },
      include: {
        media: true,
        tags: true,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        { error: 'Journal ID is required' },
        { status: 400 }
      );
    }

    const journalId = resolvedParams.id;

    // Fetch journal to get media public_ids
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      include: { media: true },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    // Delete media from Cloudinary
    for (const media of journal.media) {
      if (media.publicId) {
        console.log(`[Journal DELETE /api/journals/${journalId}] Attempting to delete media with publicId: ${media.publicId}`); // Log publicId
        try {
          await deleteFromCloudinary(media.publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting media from Cloudinary:', cloudinaryError);
        }
      }
    }

    await prisma.journal.delete({
      where: {
        id: journalId,
      },
    });

    return NextResponse.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal' },
      { status: 500 }
    );
  }
}

// PUT (update) a journal by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        { error: 'Journal ID is required' },
        { status: 400 }
      );
    }

    const journalId = resolvedParams.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id: journalId },
      include: { media: true, tags: true },
    });

    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    // Delete media that were marked for deletion
    if (data.mediaToDelete && data.mediaToDelete.length > 0) {
      await prisma.media.deleteMany({
        where: {
          id: {
            in: data.mediaToDelete,
          },
          journalId: journalId,
        },
      });
    }

    // Process tags: find existing or create new ones
    let tagConnections;
    if (data.tags && data.tags.length > 0) {
      tagConnections = await Promise.all(data.tags.map(async (tagName: string) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
        return { id: tag.id };
      }));
    }

    const media = data.media || [];
    
    // Update journal
    const updatedJournal = await prisma.journal.update({
      where: { id: journalId },
      data: {
        title: data.title,
        content: data.content || null,
        location: data.location || null,
        media: {
          create: media
            .filter((item: {id?: string; url: string; publicId: string; mediaType: MediaType; caption?: string | null; width?: number | null; height?: number | null}) => !item.id)
            .map((item: {id?: string; url: string; publicId: string; mediaType: MediaType; caption?: string | null; width?: number | null; height?: number | null}) => ({
              url: item.url,
              publicId: item.publicId,
              mediaType: item.mediaType as MediaType,
              caption: item.caption || null,
              width: item.width || null,
              height: item.height || null,
            })),

        },
        tags: {
          set: [],
          connect: tagConnections || [],
        },
      },
      include: {
        media: true,
        tags: true,
      },
    });
    
    return NextResponse.json(updatedJournal);
  } catch (error) {
    console.error('Error updating journal:', error);
    return NextResponse.json(
      { error: 'Failed to update journal' },
      { status: 500 }
    );
  }
}

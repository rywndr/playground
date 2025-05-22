import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MediaType, Prisma } from '../../../prisma/app/generated/prisma';

// interfaces
interface MediaInput {
  url: string;
  publicId: string;
  mediaType: MediaType;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

interface JournalPostData {
  title: string;
  content?: string | null;
  location?: string | null;
  media?: MediaInput[];
  tags?: string[];
}

// GET all journals with filtering, sorting, and searching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');
    const sortOption = searchParams.get('sort') || 'date_desc';
    const tagIds = searchParams.get('tags')?.split(',');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.JournalWhereInput = {};
    let orderBy: Prisma.JournalOrderByWithRelationInput = {};

    // Search query for title
    if (searchQuery) {
      where.title = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    // Tag filtering
    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          id: {
            in: tagIds,
          },
        },
      };
    }

    // Date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        if(where.date && typeof where.date === 'object') {
            (where.date as Prisma.DateTimeFilter).gte = new Date(startDate);
        }
      }
      if (endDate) {
        // Add 1 day to endDate to make it inclusive of the selected day
        const inclusiveEndDate = new Date(endDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
        if(where.date && typeof where.date === 'object') {
            (where.date as Prisma.DateTimeFilter).lt = inclusiveEndDate;
        }
      }
    }

    // Sorting options
    switch (sortOption) {
      case 'date_asc':
        orderBy = { date: 'asc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'date_desc':
      default:
        orderBy = { date: 'desc' };
        break;
    }

    const journals = await prisma.journal.findMany({
      where,
      include: {
        media: true,
        tags: true,
      },
      orderBy,
    });

    return NextResponse.json(journals);
  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 }
    );
  }
}

// POST create new journal
export async function POST(request: NextRequest) {
  try {
    const data: JournalPostData = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Process tags: find existing or create new ones
    const tagConnections = data.tags && data.tags.length > 0
      ? await Promise.all(data.tags.map(async (tagName: string) => {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          return { id: tag.id };
        }))
      : undefined;

    // Create journal
    const journal = await prisma.journal.create({
      data: {
        title: data.title,
        content: data.content || null,
        location: data.location || null,
        media: data.media && data.media.length > 0 
          ? {
              create: data.media.map(item => ({
                url: item.url,
                publicId: item.publicId,
                mediaType: item.mediaType,
                caption: item.caption || null,
                width: item.width || null,
                height: item.height || null,
              }))
            }
          : undefined,
        // Connect tags if provided
        tags: tagConnections ? { connect: tagConnections } : undefined,
      },
      include: {
        media: true,
        tags: true,
      },
    });
    
    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json(
      { error: 'Failed to create journal' },
      { status: 500 }
    );
  }
}

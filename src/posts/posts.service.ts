import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}
  async getPosts() {
    try {
      const postCount = await this.prisma.post.count();
      const posts = await this.prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      const groupPosts = await this.prisma.post.groupBy({
        by: ['userId'],
        _sum: {
          likes: true,
        },
        having: {
          likes: {
            _sum: {
              gt: 100,
            },
          },
        },
      });
      return {
        count: postCount,
        allPosts: posts,
        groupPostsByUser: groupPosts,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async getFeaturedPosts() {
    const posts = await this.prisma.post.findMany({
      where: {
        visibility: 'FEATURED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      featuredPosts: posts,
    };
  }

  async getPostById(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return post;
  }

  async createPost(userId: number, post: CreatePostDto) {
    const newPost = await this.prisma.post.create({
      data: {
        userId,
        ...post,
      },
    });

    return newPost;
  }

  async updatePost(postId: number, post: UpdatePostDto) {
    return await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...post,
      },
    });
  }

  async updateVisiblityOfPost(postId: number, post: UpdatePostDto) {
    return await this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        visibility: post.visibility,
      },
    });
  }

  async deletePost(postId: number) {
    await this.prisma.post.delete({
      where: {
        id: postId,
      },
    });
    return {
      msg: 'Post deleted successfuly',
    };
  }

  async deleteAllPosts() {
    await this.prisma.post.deleteMany();
    return {
      msg: 'All posts deleted',
    };
  }
}

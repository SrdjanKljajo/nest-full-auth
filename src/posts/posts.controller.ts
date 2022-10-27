import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
  Patch,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard, RolesGuard } from '../auth/guard';
import { Roles } from '../auth/decorator';
import { admin, author, moderator } from '../utils/roleHandler';
@Controller('posts')
export default class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts() {
    return this.postsService.getPosts();
  }

  @Get('featured')
  async getFeaturedPosts() {
    return await this.postsService.getFeaturedPosts();
  }

  @Get(':postId')
  async getPostById(@Param('postId', ParseIntPipe) postId: number) {
    return await this.postsService.getPostById(postId);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(author, moderator, admin)
  async createPost(@GetUser('id') userId: number, @Body() post: CreatePostDto) {
    return await this.postsService.createPost(userId, post);
  }

  @Put(':postId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(author, moderator, admin)
  async updatePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() post: UpdatePostDto,
  ) {
    return await this.postsService.updatePost(postId, post);
  }

  @Patch(':postId/visibility')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(moderator, admin)
  async updateVisiblityOfPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() post: UpdatePostDto,
  ) {
    return this.postsService.updateVisiblityOfPost(postId, post);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':postId')
  @UseGuards(JwtGuard)
  async deletePost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.deletePost(postId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(admin)
  async deleteAllPosts() {
    return await this.postsService.deleteAllPosts();
  }
}

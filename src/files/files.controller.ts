import {
  Controller,
  Get,
  Query,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { filebaseClient } from '../document/filebase.client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiTags('files')
@ApiBearerAuth('JWT-auth')
export class FilesController {
  @Get('download')
  @ApiOperation({
    summary: 'Download file from Filebase S3 storage',
    description:
      'Proxy endpoint to download files from private Filebase bucket. Accepts a file URL and streams the file back to the client.',
  })
  @ApiQuery({
    name: 'url',
    description: 'Full Filebase S3 URL of the file to download',
    example: 'https://s3.filebase.com/storyforge-documents/documents/1/abc-123.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or missing URL parameter',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found in storage',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while fetching file',
  })
  async downloadFile(@Query('url') fileUrl: string, @Res() res: Response) {
    if (!fileUrl) {
      throw new HttpException('Missing file URL parameter', HttpStatus.BAD_REQUEST);
    }

    try {
      // Parse URL to extract bucket and key
      // Example URL: https://s3.filebase.com/storyforge-documents/documents/1/file.pdf
      const urlObj = new URL(fileUrl);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      if (pathParts.length < 2) {
        throw new HttpException('Invalid file URL format', HttpStatus.BAD_REQUEST);
      }

      const bucket = pathParts[0]; // storyforge-documents
      const key = pathParts.slice(1).join('/'); // documents/1/file.pdf

      // Validate bucket matches env config
      if (bucket !== process.env.FILEBASE_BUCKET) {
        throw new HttpException('Invalid bucket in URL', HttpStatus.BAD_REQUEST);
      }

      // Get object from S3
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await filebaseClient.send(command);

      // Set response headers
      res.setHeader(
        'Content-Type',
        response.ContentType || 'application/octet-stream',
      );
      res.setHeader('Content-Length', response.ContentLength || 0);

      // Extract filename from key
      const filename = key.split('/').pop() || 'download';
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Stream the file to client
      if (response.Body) {
        // @ts-ignore - AWS SDK v3 returns ReadableStream
        response.Body.pipe(res);
      } else {
        throw new HttpException('File body is empty', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error: any) {
      console.error('File download error:', error);

      // Handle S3 specific errors
      if (error.name === 'NoSuchKey') {
        throw new HttpException('File not found in storage', HttpStatus.NOT_FOUND);
      }

      // If already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Generic error
      throw new HttpException(
        `Failed to download file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('signed-url')
  @ApiOperation({
    summary: 'Get signed URL for file viewing',
    description:
      'Generate a pre-signed URL for viewing files from Filebase S3 storage. URL expires in 1 hour.',
  })
  @ApiQuery({
    name: 'url',
    description: 'Full Filebase S3 URL of the file',
    example: 'https://s3.filebase.com/storyforge-documents/documents/1/abc-123.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        signedUrl: {
          type: 'string',
          description: 'Pre-signed URL valid for 1 hour',
          example: 'https://s3.filebase.com/storyforge-documents/documents/1/abc-123.pdf?X-Amz-Algorithm=...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or missing URL parameter',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while generating signed URL',
  })
  async getSignedUrl(@Query('url') fileUrl: string) {
    if (!fileUrl) {
      throw new HttpException('Missing file URL parameter', HttpStatus.BAD_REQUEST);
    }

    try {
      // Parse URL to extract bucket and key
      // Example URL: https://s3.filebase.com/storyforge-documents/documents/1/file.pdf
      const urlObj = new URL(fileUrl);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      if (pathParts.length < 2) {
        throw new HttpException('Invalid file URL format', HttpStatus.BAD_REQUEST);
      }

      const bucket = pathParts[0]; // storyforge-documents
      const key = pathParts.slice(1).join('/'); // documents/1/file.pdf

      // Validate bucket matches env config
      if (bucket !== process.env.FILEBASE_BUCKET) {
        throw new HttpException('Invalid bucket in URL', HttpStatus.BAD_REQUEST);
      }

      // Determine Content-Type based on file extension
      const getContentType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const contentTypes: Record<string, string> = {
          md: 'text/markdown; charset=utf-8',
          markdown: 'text/markdown; charset=utf-8',
          txt: 'text/plain; charset=utf-8',
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          doc: 'application/msword',
          html: 'text/html; charset=utf-8',
          htm: 'text/html; charset=utf-8',
          json: 'application/json; charset=utf-8',
          xml: 'application/xml; charset=utf-8',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          svg: 'image/svg+xml',
        };
        return contentTypes[ext || ''] || 'application/octet-stream';
      };

      const filename = key.split('/').pop() || 'file';
      const contentType = getContentType(filename);

      // Create GetObjectCommand with proper Content-Type for inline viewing
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        ResponseContentDisposition: 'inline',
        ResponseContentType: contentType,
      });

      // Generate signed URL (expires in 1 hour)
      const signedUrl = await getSignedUrl(filebaseClient, command, {
        expiresIn: 60 * 60, // 1 hour
      });

      return {
        signedUrl,
      };
    } catch (error: any) {
      console.error('Signed URL generation error:', error);

      // If already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Generic error
      throw new HttpException(
        `Failed to generate signed URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

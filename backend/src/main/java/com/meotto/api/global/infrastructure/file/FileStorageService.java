package com.meotto.api.global.infrastructure.file;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.infrastructure.file.exception.FileErrorCode;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class FileStorageService {

	private static final long MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
	private static final Set<String> ALLOWED_IMAGE_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp",
		"image/heic");

	private final S3Client s3Client;
	private final String bucket;
	private final String region;

	public FileStorageService(S3Client s3Client, S3Properties properties) {
		this.s3Client = s3Client;
		this.bucket = properties.bucket();
		this.region = properties.region();
	}

	public String storeImage(MultipartFile file) {
		validateImage(file);
		return store(file);
	}

	private void validateImage(MultipartFile file) {
		if (file.isEmpty() || file.getSize() > MAX_IMAGE_SIZE_BYTES
			|| !ALLOWED_IMAGE_CONTENT_TYPES.contains(file.getContentType())) {
			throw new BusinessException(FileErrorCode.INVALID_IMAGE);
		}
	}

	private String store(MultipartFile file) {
		String originalFilename = file.getOriginalFilename();
		String extension = (originalFilename != null && originalFilename.contains("."))
			? originalFilename.substring(originalFilename.lastIndexOf("."))
			: "";
		String filename = UUID.randomUUID().toString().replace("-", "") + extension;

		try {
			s3Client.putObject(
				PutObjectRequest.builder()
					.bucket(bucket)
					.key(filename)
					.contentType(file.getContentType())
					.contentLength(file.getSize())
					.build(),
				RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
		} catch (IOException e) {
			throw new UncheckedIOException("파일 업로드 실패", e);
		}

		return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + filename;
	}
}

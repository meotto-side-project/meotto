package com.meotto.api.global.infrastructure.file;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.meotto.api.global.exception.BusinessException;
import com.meotto.api.global.infrastructure.file.exception.FileErrorCode;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

	@Mock
	private S3Client s3Client;

	private FileStorageService fileStorageService;

	@BeforeEach
	void setUp() {
		fileStorageService = new FileStorageService(s3Client, new S3Properties("test-bucket", "ap-northeast-2"));
	}

	@Test
	void storeImage_빈파일이면_예외를_던진다() {
		MockMultipartFile file = new MockMultipartFile("file", "empty.jpg", "image/jpeg", new byte[0]);

		assertThatThrownBy(() -> fileStorageService.storeImage(file))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(FileErrorCode.INVALID_IMAGE));
	}

	@Test
	void storeImage_10MB를_초과하면_예외를_던진다() {
		byte[] oversized = new byte[11 * 1024 * 1024];
		MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", oversized);

		assertThatThrownBy(() -> fileStorageService.storeImage(file))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(FileErrorCode.INVALID_IMAGE));
	}

	@Test
	void storeImage_허용되지_않은_포맷이면_예외를_던진다() {
		MockMultipartFile file = new MockMultipartFile("file", "a.gif", "image/gif", "data".getBytes());

		assertThatThrownBy(() -> fileStorageService.storeImage(file))
			.isInstanceOf(BusinessException.class)
			.satisfies(e -> assertThat(((BusinessException)e).getErrorCode())
				.isEqualTo(FileErrorCode.INVALID_IMAGE));
	}

	@Test
	void storeImage_허용된_이미지면_S3_URL을_반환한다() {
		when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
			.thenReturn(PutObjectResponse.builder().build());
		MockMultipartFile file = new MockMultipartFile("file", "a.jpg", "image/jpeg", "data".getBytes());

		String url = fileStorageService.storeImage(file);

		assertThat(url).startsWith("https://test-bucket.s3.ap-northeast-2.amazonaws.com/");
		assertThat(url).endsWith(".jpg");
	}
}

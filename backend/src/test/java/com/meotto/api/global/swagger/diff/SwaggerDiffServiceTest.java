package com.meotto.api.global.swagger.diff;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class SwaggerDiffServiceTest {

	@Mock
	private RedisTemplate<String, String> redisTemplate;

	@Mock
	private ValueOperations<String, String> valueOperations;

	private SwaggerDiffService swaggerDiffService;

	private static final String BASE_SPEC = """
		{
		  "paths": {
		    "/api/stamps": {
		      "get": {
		        "summary": "도장 목록 조회",
		        "responses": {
		          "200": {
		            "content": {
		              "application/json": {
		                "schema": { "type": "object" }
		              }
		            }
		          }
		        }
		      }
		    }
		  },
		  "components": { "schemas": {} }
		}
		""";

	@BeforeEach
	void setUp() {
		swaggerDiffService = new SwaggerDiffService(redisTemplate, new ObjectMapper());
	}

	@Test
	void 이전_스냅샷이_없으면_초기_저장만_하고_빈_결과를_반환한다() {
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("swagger:spec:snapshot")).thenReturn(null);

		Optional<SwaggerDiffResult> result = swaggerDiffService.compareAndSave(BASE_SPEC);

		assertThat(result).isEmpty();
	}

	@Test
	void 엔드포인트가_추가되면_added에_포함된다() {
		String currentSpec = """
			{
			  "paths": {
			    "/api/stamps": {
			      "get": {
			        "summary": "도장 목록 조회",
			        "responses": {
			          "200": { "content": { "application/json": { "schema": { "type": "object" } } } }
			        }
			      }
			    },
			    "/api/friends": {
			      "get": {
			        "summary": "친구 목록 조회",
			        "responses": {
			          "200": { "content": { "application/json": { "schema": { "type": "object" } } } }
			        }
			      }
			    }
			  },
			  "components": { "schemas": {} }
			}
			""";
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("swagger:spec:snapshot")).thenReturn(BASE_SPEC);

		SwaggerDiffResult result = swaggerDiffService.compareAndSave(currentSpec).orElseThrow();

		assertThat(result.hasChanges()).isTrue();
		assertThat(result.added()).hasSize(1);
		assertThat(result.added().get(0).key()).isEqualTo("GET /api/friends");
		assertThat(result.removed()).isEmpty();
		assertThat(result.changed()).isEmpty();
	}

	@Test
	void 엔드포인트가_삭제되면_removed에_포함된다() {
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("swagger:spec:snapshot")).thenReturn(BASE_SPEC);

		String currentSpec = """
			{ "paths": {}, "components": { "schemas": {} } }
			""";

		SwaggerDiffResult result = swaggerDiffService.compareAndSave(currentSpec).orElseThrow();

		assertThat(result.hasChanges()).isTrue();
		assertThat(result.removed()).hasSize(1);
		assertThat(result.removed().get(0).key()).isEqualTo("GET /api/stamps");
		assertThat(result.added()).isEmpty();
	}

	@Test
	void 엔드포인트_내용이_바뀌면_changed에_포함된다() {
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("swagger:spec:snapshot")).thenReturn(BASE_SPEC);

		String currentSpec = """
			{
			  "paths": {
			    "/api/stamps": {
			      "get": {
			        "summary": "도장 목록 조회 (수정됨)",
			        "responses": {
			          "200": { "content": { "application/json": { "schema": { "type": "object" } } } }
			        }
			      }
			    }
			  },
			  "components": { "schemas": {} }
			}
			""";

		SwaggerDiffResult result = swaggerDiffService.compareAndSave(currentSpec).orElseThrow();

		assertThat(result.hasChanges()).isTrue();
		assertThat(result.changed()).hasSize(1);
		assertThat(result.changed().get(0).key()).isEqualTo("GET /api/stamps");
	}

	@Test
	void 변경이_없으면_hasChanges가_false이다() {
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		when(valueOperations.get("swagger:spec:snapshot")).thenReturn(BASE_SPEC);

		SwaggerDiffResult result = swaggerDiffService.compareAndSave(BASE_SPEC).orElseThrow();

		assertThat(result.hasChanges()).isFalse();
	}
}

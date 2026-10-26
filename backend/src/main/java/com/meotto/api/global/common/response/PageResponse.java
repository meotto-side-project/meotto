package com.meotto.api.global.common.response;

import java.util.List;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class PageResponse<T> {

	private final List<T> content;
	private final long totalCount;
	private final int page;
	private final int size;
}

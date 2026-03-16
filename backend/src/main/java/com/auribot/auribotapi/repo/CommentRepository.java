package com.auribot.auribotapi.repo;

import com.auribot.auribotapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
	List<Comment> findTop10ByOrderByIdDesc();
}

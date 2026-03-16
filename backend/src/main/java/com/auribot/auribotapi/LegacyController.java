package com.auribot.auribotapi;

import com.auribot.auribotapi.dto.AuthRequest;
import com.auribot.auribotapi.dto.PostCommentRequest;
import com.auribot.auribotapi.model.Comment;
import com.auribot.auribotapi.model.User;
import com.auribot.auribotapi.repo.CommentRepository;
import com.auribot.auribotapi.repo.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LegacyController {

	private final UserRepository userRepository;
	private final CommentRepository commentRepository;

	public LegacyController(UserRepository userRepository, CommentRepository commentRepository) {
		this.userRepository = userRepository;
		this.commentRepository = commentRepository;
	}

	@PostMapping(path = "/signup", consumes = "application/json")
	public ResponseEntity<String> signup(@RequestBody AuthRequest req) {
		if (req.getUsername() == null || req.getUsername().isBlank() || req.getPassword() == null) {
			return ResponseEntity.badRequest().body("Missing username/password");
		}

		if (userRepository.existsById(req.getUsername())) {
			return ResponseEntity.badRequest().body("User exists");
		}

		userRepository.save(new User(req.getUsername(), req.getPassword()));
		return ResponseEntity.ok("User created");
	}

	@PostMapping(path = "/login", consumes = "application/json")
	public ResponseEntity<String> login(@RequestBody AuthRequest req) {
		if (req.getUsername() == null || req.getUsername().isBlank() || req.getPassword() == null) {
			return ResponseEntity.badRequest().body("Missing username/password");
		}

		return userRepository.findById(req.getUsername())
				.filter(u -> u.getPassword().equals(req.getPassword()))
				.map(u -> ResponseEntity.ok("Logged in"))
				.orElseGet(() -> ResponseEntity.status(401).body("Wrong credentials"));
	}

	@PostMapping(path = "/post-comment", consumes = "application/json")
	public ResponseEntity<String> postComment(@RequestBody PostCommentRequest req) {
		if (req.getAuthor() == null || req.getAuthor().isBlank() || req.getContent() == null || req.getContent().isBlank()) {
			return ResponseEntity.badRequest().body("Missing author/content");
		}
		commentRepository.save(new Comment(req.getAuthor(), req.getContent()));
		return ResponseEntity.ok("Comment posted");
	}

	@GetMapping("/get-comments")
	public List<List<String>> getComments() {
		// Keep the legacy shape: list of [author, content]
		return commentRepository.findAll().stream()
				.map(c -> List.of(c.getAuthor(), c.getContent()))
				.toList();
	}

	@GetMapping("/get-recent-comments")
	public List<List<String>> getRecentComments() {
		return commentRepository.findTop10ByOrderByIdDesc().stream()
				.map(c -> List.of(c.getAuthor(), c.getContent()))
				.toList();
	}
}

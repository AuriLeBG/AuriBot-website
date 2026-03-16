package com.auribot.auribotapi.repo;

import com.auribot.auribotapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}

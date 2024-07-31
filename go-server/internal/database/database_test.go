package database

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/joho/godotenv"
)

// Test the database connection
func TestDatabaseConnection(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		t.Error(err)
	}
	s := New()
	message := s.Health()
	if message == nil {
		t.Errorf(err.Error())
	}
}

// Test creating a user
func TestCreateUser(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		t.Fatalf("Error loading .env file: %v", err)
	}
	s := New()
	err = s.CreateUser(context.Background(), "11434", "hank@example.com", "not-an-actual-image")
	if err != nil {
		t.Errorf(err.Error())
	}
	fmt.Println("IT WORKED")
}

// Test getting a user from the database by their ID
func TestGetUserByID(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		t.Fatalf("Error loading .env file: %v", err)
	}
	s := New()
	user, err := s.GetUserByID(1)
	if err != nil {
		t.Errorf(err.Error())
	}
	if user.Email != "hank@example.com" {
		t.Errorf("Unable to correctly retrieve user")
	}
}

// Test getting a user from the database by tehir email address
func TestGetUserByEmail(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		t.Fatalf("Error loading .env file: %v", err)
	}
	s := New()
	user, err := s.GetUserByEmail("hank@example.com")
	if err != nil {
		t.Errorf(err.Error())
	}
	if user.UserID != 1 {
		t.Errorf("Unable to correctly retrieve user")
	}
}

// Test inserting a task into the database
func TestInsertTask(t *testing.T) {
	err := godotenv.Load("../../.env")
	if err != nil {
		t.Fatalf("Error loading .env file: %v", err)
	}
	s := New()
	tz, err := time.LoadLocation("UTC")
	if err != nil {
		t.Errorf(err.Error())
	}
	err = s.InsertTask(
		1,
		"Submit job application",
		"apple.com",
		time.Date(2024, time.July, 10, 10, 0, 0, 0, tz),
		true,
		false,
	)
	if err != nil {
		t.Errorf(err.Error())
	}
}

// Test getting a task from the database by it's ID
// func TestGetTaskByID(t *testing.T) {
// 	err := godotenv.Load("../../.env")
// 	if err != nil {
// 		t.Fatalf("Error loading .env file: %v", err)
// 	}
// 	s := New()
// 	task, err := s.GetTaskByID(1, 1)
// 	if err != nil {
// 		t.Errorf(err.Error())
// 	}
// 	if task.Title != "Submit job application" {
// 		t.Errorf("unable to correctly retrieve tasks")
// 	}
// }

// // Test deleting a task from the database
// func TestDeleteTask(t *testing.T) {
// 	err := godotenv.Load("../../.env")
// 	if err != nil {
// 		t.Fatalf("Error loading .env file: %v", err)
// 	}
// 	s := New()
// 	row, err := s.GetTaskByID(1, 1)
// 	if err != nil {
// 		t.Errorf(err.Error())
// 	}
// 	err = s.DeleteTask(1, 1)
// 	if err != nil {
// 		t.Errorf(err.Error())
// 	}
// 	row, err = s.GetTaskByID(1, 1)
// 	if err == nil {
// 		t.Errorf("Row still exists in databse: %v", row)
// 	}
// }

// // Test deleting a user from the database
// func TestDeleteUser(t *testing.T) {
// 	err := godotenv.Load("../../.env")
// 	if err != nil {
// 		t.Fatalf("Error loading .env file: %v", err)
// 	}
// 	s := New()
// 	row, err := s.GetUserByID(1)
// 	if err != nil {
// 		t.Errorf(err.Error())
// 	}
// 	err = s.DeleteUser(1)
// 	if err != nil {
// 		t.Errorf(err.Error())
// 	}
// 	row, err = s.GetUserByID(1)
// 	if err == nil {
// 		t.Errorf("Row still exists in databse: %v", row)
// 	}
// }

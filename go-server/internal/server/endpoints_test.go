package server

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"task-flow-server/internal/database"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// run make docker-run to initialize postgres container

// run before GET functions
func TestCreate(t *testing.T) {
	s := &Server{}
	r := s.RegisterRoutes()

	task := database.Task{
		UserID:    123,
		Title:     "Title of task",
		Due:       time.Now(),
		Delegate:  false,
		Important: false,
	}

	jsonTask, err := json.Marshal(task)
	if err != nil {
		t.Errorf(err.Error())
	}

	req, err := http.NewRequest("POST", "users/123/tasks/", bytes.NewBuffer(jsonTask))
	if err != nil {
		t.Errorf("Error making request. Err: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.JSONEq(t, string(jsonTask), resp.Body.String(), "Expected JSON: %s\nActual JSON: %s", string(jsonTask), resp.Body.String())
}

// func TestGetTask(t *testing.T) {
// 	s := &Server{}
// 	r := s.RegisterRoutes()

// 	req, err := http.NewRequest("GET", "users/123/tasks/0", nil)
// 	if err != nil {
// 		t.Errorf("Error making request. Err: %v", err)
// 	}
// }

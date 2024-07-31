package server

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strconv"
	"sync"
	"task-flow-server/internal/database"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
)

type State struct {
	Str string `json:"state"`
	Url string `json:"url"`
}

type Auth struct {
	State string `json:"state"`
	Code  string `json:"code"`
}

var stateStore = struct {
	sync.RWMutex
	states map[string]time.Time
}{states: make(map[string]time.Time)}

// Client Server sided: lists tasks based on URL given user_id
func (s *Server) List(w http.ResponseWriter, r *http.Request) {
	_, _, _ = jwtauth.FromContext(r.Context())

	uidParam := chi.URLParam(r, "user_id")

	// userID is uint64 must be uint32
	userID64, err := strconv.ParseUint(uidParam, 10, 32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Fatalf("error reading UserID. Err: %v", err.Error())
	}
	userID32 := uint32(userID64)

	err = json.NewDecoder(r.Body).Decode(&userID32)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Fatalf("error reading JSON request. Err: %v", err.Error())
	}

	tasks, err := s.db.GetTasksByUserID(userID32)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Fatalf("error with GetTasksByUserID. Err: %v", err.Error())
	}

	err = json.NewEncoder(w).Encode(tasks)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Fatalf("error with encoding. Err: %v", err.Error())
	}

	w.WriteHeader(http.StatusOK)
}

// Client Server sided: grabs single task based on URL given user_id and task_id
func (s *Server) GetTask(w http.ResponseWriter, r *http.Request) {
	uidParam := chi.URLParam(r, "user_id")
	tidParam := chi.URLParam(r, "task_id")

	var userID64 uint64
	var err error
	var taskID uuid.UUID

	if userID64, err = strconv.ParseUint(uidParam, 10, 32); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading UserID. Err: %v", err.Error())
	}
	userID32 := uint32(userID64)

	if taskID, err = uuid.Parse(tidParam); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading taskID. Err: %v", err.Error())
	}

	task, err := s.db.GetTaskByID(userID32, taskID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Fatalf("error with GetTaskByID. Err: %v", err.Error())
	}

	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(task); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Fatalf("error encoding write. Err: %v", err.Error())
	}

	w.WriteHeader(http.StatusOK)
}

// Client Server sided: creates a task for User
func (s *Server) Create(w http.ResponseWriter, r *http.Request) {
	var task database.Task
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading request body. Err: %v", err)
		return
	}
	defer r.Body.Close()

	if err = task.UnmarshalJSON(body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error unmarshaling JSON request. Err: %v", err)
		return
	}

	if err = s.db.InsertTask(
		task.UserID,
		task.Title,
		task.Description,
		task.Due,
		task.Delegate,
		task.Important,
	); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("error inserting task. Err: %v", err.Error())
	}

	jsonResp, err := task.MarshalJSON()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("error handling JSON marshal. Err: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonResp)
	if err != nil {
		log.Printf("error writing response. Err: %s", err.Error())
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) Update(w http.ResponseWriter, r *http.Request) {
	var task database.Task
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading request body. Err: %v", err)
		return
	}
	defer r.Body.Close()

	if err = task.UnmarshalJSON(body); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error unmarshaling JSON request. Err: %v", err)
		return
	}
	if err = s.db.InsertTask(
		task.UserID,
		task.Title,
		task.Description,
		task.Due,
		task.Delegate,
		task.Important,
	); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("error inserting task. Err: %v", err.Error())
	}

	jsonResp, err := task.MarshalJSON()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Printf("error handling JSON marshal. Err: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonResp)
	if err != nil {
		log.Printf("error writing response. Err: %s", err.Error())
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) TaskDelete(w http.ResponseWriter, r *http.Request) {
	uidParam := chi.URLParam(r, "user_id")
	tidParam := chi.URLParam(r, "task_id")

	var userID64 uint64
	var err error
	var taskID uuid.UUID

	if userID64, err = strconv.ParseUint(uidParam, 10, 32); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading UserID. Err: %v", err.Error())
	}
	userID32 := uint32(userID64)

	if taskID, err = uuid.Parse(tidParam); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading taskID. Err: %v", err.Error())
	}

	if err = s.db.DeleteTask(userID32, taskID); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading taskID. Err: %v", err.Error())
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) UserDelete(w http.ResponseWriter, r *http.Request) {
	uidParam := chi.URLParam(r, "user_id")

	var userID64 uint64
	var err error

	if userID64, err = strconv.ParseUint(uidParam, 10, 32); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading UserID. Err: %v", err.Error())
	}
	userID32 := uint32(userID64)

	if err = s.db.DeleteUser(userID32); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		log.Printf("error reading taskID. Err: %v", err.Error())
	}

	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	state, err := generateStateString(32)
	if err != nil {
		http.Error(w, "Failed to generate state", http.StatusInternalServerError)
		return
	}

	stateStore.Lock()
	stateStore.states[state] = time.Now()
	stateStore.Unlock()

	//log.Printf(state)
	url := googleOauthConfig.AuthCodeURL(state)
	state_info := new(State)
	state_info.Str = state
	state_info.Url = url
	json.NewEncoder(w).Encode(state_info)
	// http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// Handle authentication
// Front-end should include the following in the request body
// ```json
//
//	{
//	  "code":"{code recieved from google}"
//	  "state":"{state string recieved from GET /auth/google/login}"
//	}
//
// ```
func (s *Server) GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	auth_info := new(Auth)
	err := json.NewDecoder(r.Body).Decode(&auth_info)
	if err != nil {
		log.Printf("invalid request format. Err: %v", err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	stateStore.RLock()
	storedTime, exists := stateStore.states[auth_info.State]
	stateStore.RUnlock()

	// log.Printf("Passed: %s", auth_info.State)
	// log.Printf("Actual: %s", r.FormValue("state"))
	if !exists {
		log.Println("invalid oauth state")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Check if the state is too old
	if time.Since(storedTime) > 10*time.Minute {
		http.Error(w, "State parameter expired", http.StatusBadRequest)
		return
	}

	code := auth_info.Code
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		log.Println("code exchange failed: ", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	response, err := http.Get(
		"https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken,
	)
	if err != nil {
		log.Println("failed getting user info: ", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	defer response.Body.Close()

	var userInfo struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		VerifiedEmail bool   `json:"verified_email"`
		Picture       string `json:"picture"`
	}
	if err := json.NewDecoder(response.Body).Decode(&userInfo); err != nil {
		log.Println("failed to decode user info: ", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Insert or update user in the database
	err = s.db.CreateUser(context.Background(), userInfo.ID, userInfo.Email, userInfo.Picture)
	if err != nil {
		log.Println("failed to save user info: ", err)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// Sign and issue a JWT
	_, tokenString, err := tokenAuth.Encode(map[string]interface{}{"user_id": userInfo.ID})
	if err != nil {
		log.Fatalf("error encoding JWT. Err: %v", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Clean up the state after successful validation
	stateStore.Lock()
	delete(stateStore.states, auth_info.State)
	stateStore.Unlock()

	// Write the response
	w.Write([]byte(tokenString))
}

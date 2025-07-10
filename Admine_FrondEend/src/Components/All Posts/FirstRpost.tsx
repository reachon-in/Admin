import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Css/FirstRpost.module.css";
import { fastRService } from "../../../services/api";

const FirstRpost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioMode, setAudioMode] = useState<"record" | "upload">("record");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const photopeaConfig = {
    files: image ? [image] : [],
    server: {
      version: 1,
      url: `${import.meta.env.VITE_API_URL}/save-image`,
      formats: ["png", "jpg:0.8"],
    },
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(photopeaConfig));
  const photopeaUrl = `https://www.photopea.com#${encodedConfig}`;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      
      // Send tags as a JSON string array
      formData.append("tags", JSON.stringify(tags));
      
      formData.append("type", "fastr");
      
      if (image) {
        // Convert base64 to blob
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append("content", blob, "image.jpg");
      }
      
      if (audioFile) {
        formData.append("audio", audioFile);
      } else if (audioUrl) {
        // Convert audio URL to blob
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        formData.append("audio", blob, "audio.mp3");
      }

      const response = await fastRService.createFastR(formData);

      if (response.success) {
        console.log("FastR ID:", response.data._id);
        setShowSuccess(true);
        setTimeout(() => {
          navigate(-1);
        }, 2000);
        navigate("/posts");
      } else {
        console.error("Error creating FastR:", response.message);
      }
    } catch (error) {
      console.error("Error posting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        // 30MB limit
        alert("Audio file size should be less than 30MB");
        return;
      }
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    }
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Create FirstR Post</h1>
          <div className={styles.topBarActions}>
            <button
              className={styles.cancelBtn}
              type="button"
              onClick={() => navigate(-1)}>
              X Cancel
            </button>
          </div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={`${styles.input} ${
                !title.trim() ? styles.inputError : ""
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
            />
            {!title.trim() && (
              <span className={styles.errorMessage}>Title is required</span>
            )}
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagsContainer}>
              <div className={styles.tagsList}>
                {tags.map((tag, index) => (
                  <div key={index} className={styles.tagChip}>
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className={styles.removeTag}>
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type and press Enter to add tags"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Image Content</label>
            <div className={styles.imageUploadContainer}>
              {!image ? (
                <div className={styles.imageUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.imageInput}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className={styles.imageUploadLabel}>
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Upload Image (Max 5MB)</span>
                  </label>
                </div>
              ) : (
                <div className={styles.imagePreview}>
                  <img src={image} alt="Preview" className={styles.previewImage} />
                  <button
                    type="button"
                    onClick={removeImage}
                    className={styles.removeImageButton}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 5L5 15M5 5L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Add Your Voice (Max 30 sec)</label>
            <div className={styles.voiceContainer}>
              {!audioUrl ? (
                <>
                  <div className={styles.audioModeSelector}>
                    <button
                      type="button"
                      className={`${styles.audioModeButton} ${
                        audioMode === "record" ? styles.active : ""
                      }`}
                      onClick={() => setAudioMode("record")}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 11V12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12V11M12 19V22M12 22H15M12 22H9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Record
                    </button>
                    <button
                      type="button"
                      className={`${styles.audioModeButton} ${
                        audioMode === "upload" ? styles.active : ""
                      }`}
                      onClick={() => setAudioMode("upload")}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Upload
                    </button>
                  </div>

                  {audioMode === "record" ? (
                    <div className={styles.voiceControls}>
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`${styles.voiceButton} ${
                          isRecording ? styles.recording : ""
                        }`}>
                        {isRecording ? (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <rect
                              x="6"
                              y="6"
                              width="12"
                              height="12"
                              rx="2"
                              fill="currentColor"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="6" fill="currentColor" />
                          </svg>
                        )}
                      </button>
                      <span className={styles.recordingTime}>
                        {formatTime(recordingTime)} / 0:30
                      </span>
                    </div>
                  ) : (
                    <div className={styles.audioUpload}>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        ref={audioInputRef}
                        className={styles.audioInput}
                        id="audio-upload"
                      />
                      <label
                        htmlFor="audio-upload"
                        className={styles.audioUploadLabel}>
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Upload Audio (Max 30 sec)</span>
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.audioPreview}>
                  <audio
                    src={audioUrl}
                    controls
                    className={styles.audioPlayer}
                  />
                  <button
                    type="button"
                    onClick={deleteAudio}
                    className={styles.deleteButton}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 5L5 15M5 5L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.firstRHeader}>
              <label className={styles.label}>FirstR</label>
              {!isFullScreen && (
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  className={styles.fullScreenButton}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 3L7 7M7 7L3 11M7 7H1M13 7L17 3M13 7L17 11M13 7V1M7 13L3 17M7 13L11 17M7 13H1M13 13L17 17M13 13L17 9M13 13V19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div
              className={`${styles.fisterContainer} ${
                isFullScreen ? styles.fullScreen : ""
              }`}>
              {isFullScreen && (
                <button
                  type="button"
                  onClick={toggleFullScreen}
                  className={styles.exitFullScreenButton}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 9L4 4M4 4H8M4 4V8M15 9L20 4M20 4H16M20 4V8M9 15L4 20M4 20H8M4 20V16M15 15L20 20M20 20H16M20 20V16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <div className={styles.photopeaContainer}>
                <iframe
                  title="Photopea Editor"
                  src={photopeaUrl}
                  className={styles.photopeaFrame}
                />
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <div className={styles.buttonWrapper}>
              <button
                type="submit"
                className={`${styles.submitButton} ${
                  !title.trim() ? styles.submitButtonDisabled : ""
                }`}
                disabled={!title.trim() || isSubmitting}>
                {isSubmitting ? "Posting..." : "Post FirstR"}
              </button>
              {showSuccess && (
                <div className={styles.successMessage}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Post created successfully!
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstRpost;

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: sage_db
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application_timeline`
--

DROP TABLE IF EXISTS `application_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_timeline` (
  `id` uuid NOT NULL,
  `event_type` varchar(30) NOT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` longtext DEFAULT NULL,
  `event_date` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `application_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `application_timeline_application_id_13178ab3_fk_applications_id` (`application_id`),
  CONSTRAINT `application_timeline_application_id_13178ab3_fk_applications_id` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_timeline`
--

LOCK TABLES `application_timeline` WRITE;
/*!40000 ALTER TABLE `application_timeline` DISABLE KEYS */;
INSERT INTO `application_timeline` VALUES
('873c69ce-cdc6-4a29-ab12-0247f1a54a9c','status_change','test','rejected','Test Completed - 0.0%','Scored 0/20 (0.0%). Candidate moved to rejected.','2026-03-11 06:39:58.582322','2026-03-11 06:39:58.582329','a600a6fe-62a8-44e1-8873-337d0f6f8e9b'),
('e4043df0-e6ac-4d8f-93e9-02b96e6afdfa','status_change',NULL,'test','Application Submitted','Applied for PHP developer at Computer Science','2026-04-24 14:42:26.407464','2026-04-24 14:42:26.407471','c32588a9-7f56-4a9a-bbde-ae4c06f8858b'),
('3b11b2bd-434a-48e5-8897-0a1df47ecc78','status_change','test','rejected','Test Completed - 0.0%','Scored 0/20 (0.0%). Candidate moved to rejected.','2026-03-11 06:39:58.584802','2026-03-11 06:39:58.584807','a600a6fe-62a8-44e1-8873-337d0f6f8e9b'),
('762f523b-483b-4c3e-8692-0aab7e1d518a','status_change',NULL,'test','Application Submitted','Applied for WEB DEveloper at CS','2026-04-23 14:57:14.644601','2026-04-23 14:57:14.644610','9358fb61-355f-4c0d-8981-62ea8c23bfbb'),
('ba2d6ed8-68b3-468e-aa03-18d57565dbf2','status_change','test','interview','Test Completed - 73.3%','Scored 11/15 (73.3%). Candidate moved to interview.','2026-04-23 11:31:25.506545','2026-04-23 11:31:25.506553','fa113ae5-6da6-47dc-8d3f-195f95b8f9da'),
('397acb00-17f9-4c70-8fdb-1cc1c96992ce','status_change','test','interview','Test Completed - 44.4%','Scored 4/9 (44.4%). Candidate moved to interview.','2026-04-24 14:54:05.060350','2026-04-24 14:54:05.060353','c32588a9-7f56-4a9a-bbde-ae4c06f8858b'),
('2ac81052-cc21-4b2a-97a6-2007fe1cc68c','status_change',NULL,'test','Application Submitted','Applied for Django Developer at Computer Sceince','2026-04-18 16:11:26.360984','2026-04-18 16:11:26.360990','bec2b381-28f6-4913-a87f-1c315605d3bc'),
('14c4ea3f-5b3d-49dc-9996-254be1ab5fcb','interview_completed','interview','reviewing','Interview Completed - 55.6%','AI interview completed. Score: 55.6%. Application moved to HR review.','2026-04-23 11:50:50.482339','2026-04-23 11:50:50.482345','fa113ae5-6da6-47dc-8d3f-195f95b8f9da'),
('09be7f61-b18b-47d9-83e2-295c9c4c5659','status_change',NULL,'test','Application Submitted','Applied for Web Engineer at CS','2026-04-18 19:37:04.616751','2026-04-18 19:37:04.616755','54d825bc-7643-4a64-8eb9-96d2e6ff5c78'),
('c8ef938a-d2d1-4fe5-9b4f-2fbbcf4d9c85','status_change','test','rejected','Test Completed - 23.3%','Scored 7/30 (23.3%). Candidate moved to rejected.','2026-04-18 16:35:54.294178','2026-04-18 16:35:54.294183','0a592ced-8c84-409f-b4fb-d76766cd0e7c'),
('05c5b4d8-b457-4ceb-be2a-4a99bcf3e24b','status_change','test','interview','Test Completed - 66.7%','Scored 10/15 (66.7%). Candidate moved to interview.','2026-04-23 15:14:54.708695','2026-04-23 15:14:54.708701','e559c7b2-6df6-49d5-bdc6-c05e44b3597a'),
('a8004d5f-842b-422c-bd93-532c8491a54f','interview_completed','interview','reviewing','Interview Completed - 51.7%','AI interview completed. Score: 51.7%. Application moved to HR review.','2026-04-22 16:03:34.970321','2026-04-22 16:03:34.970328','54d825bc-7643-4a64-8eb9-96d2e6ff5c78'),
('1c04050a-697d-4161-a1b9-59874a568bcc','status_change','test','rejected','Test Completed - 0.0%','Scored 0/9 (0.0%). Candidate moved to rejected.','2026-04-24 14:46:55.649256','2026-04-24 14:46:55.649261','c32588a9-7f56-4a9a-bbde-ae4c06f8858b'),
('3852c260-f0e2-48bd-a847-5caf4b9e7f19','status_change',NULL,'test','Application Submitted','Applied for AI Engineer at IntelliCore Technologies','2026-03-11 05:16:51.700209','2026-03-11 05:16:51.700213','a600a6fe-62a8-44e1-8873-337d0f6f8e9b'),
('42826bc8-b6ec-41db-9058-6719273870b3','status_change','test','interview','Test Completed - 53.3%','Scored 8/15 (53.3%). Candidate moved to interview.','2026-04-18 19:43:31.008554','2026-04-18 19:43:31.008558','54d825bc-7643-4a64-8eb9-96d2e6ff5c78'),
('36a19789-6974-443a-a03e-6847e0388c98','status_change','test','rejected','Test Completed - 38.0%','Scored 19/50 (38.0%). Candidate moved to rejected.','2026-04-18 16:24:51.600411','2026-04-18 16:24:51.600418','bec2b381-28f6-4913-a87f-1c315605d3bc'),
('0a284e42-d2f0-4066-aa53-86f7e2de7009','status_change','test','rejected','Test Completed - 0.0%','Scored 0/20 (0.0%). Candidate moved to rejected.','2026-04-18 16:06:20.764379','2026-04-18 16:06:20.764388','96a65aff-b8ef-407d-b5fc-4fb37e49dfad'),
('91d6e00a-8e56-41f5-a63d-9481b1176dd8','status_change',NULL,'test','Application Submitted','Applied for AI/ML Engineer at Artificial Intelligence','2026-04-23 15:07:37.993740','2026-04-23 15:07:37.993746','e559c7b2-6df6-49d5-bdc6-c05e44b3597a'),
('073efa73-ecc5-448b-bca3-95ea929758e0','status_change',NULL,'test','Application Submitted','Applied for Front-end Developer at Software Engineering','2026-03-11 01:33:36.465761','2026-03-11 01:33:36.465765','f08ab669-3dd0-4ce7-898a-d0a0b24fbac2'),
('c673000d-cb4d-4fa8-b580-a99e82ba1f71','interview_completed','interview','reviewing','Interview Completed - 50.0%','AI interview completed. Score: 50.0%. Application moved to HR review.','2026-04-19 15:22:29.912905','2026-04-19 15:22:29.912916','0a592ced-8c84-409f-b4fb-d76766cd0e7c'),
('09d0a671-0e47-458b-8b4f-af4ace1c0b7a','status_change',NULL,'test','Application Submitted','Applied for Assisstant Professor- Computer Science at Computer Science','2026-04-23 11:24:19.984299','2026-04-23 11:24:19.984304','fa113ae5-6da6-47dc-8d3f-195f95b8f9da'),
('48a34821-31c9-4fd8-be4f-b2b85d827855','status_change',NULL,'test','Application Submitted','Applied for AI Engineer at IntelliCore Technologies','2026-04-18 15:51:26.919978','2026-04-18 15:51:26.919987','96a65aff-b8ef-407d-b5fc-4fb37e49dfad'),
('9d7e5a72-8bde-4b9b-b99a-b30c0e7087be','status_change',NULL,'test','Application Submitted','Applied for Software Engineer at TechNova Solutions','2026-03-11 04:59:45.481161','2026-03-11 04:59:45.481165','b47ea96d-62b1-4c5d-ae18-afa9a8f571ed'),
('dbf62cbc-5ccf-4d3d-b987-b5de29df1395','interview_completed','interview','reviewing','Interview Completed - 51.7%','AI interview completed. Score: 51.7%. Application moved to HR review.','2026-04-23 19:12:53.947492','2026-04-23 19:12:53.947498','e559c7b2-6df6-49d5-bdc6-c05e44b3597a'),
('844c5662-260d-49af-9fb8-b72a5ee58fb5','status_change',NULL,'test','Application Submitted','Applied for Front-end developer and React Expert at Front-end team','2026-04-18 19:35:27.742659','2026-04-18 19:35:27.742663','fe38c5ea-b990-4dc6-b8a1-810598d88d27'),
('10259562-479e-4db1-872f-e20c4b1198c6','status_change','test','rejected','Test Completed - 0.0%','Scored 0/10 (0.0%). Candidate moved to rejected.','2026-03-11 01:26:15.735217','2026-03-11 01:26:15.735224','1e77028f-b421-4408-9627-51bc24860eaa'),
('b5855520-a4aa-4d15-a5e2-e4f4187eeb45','status_change',NULL,'test','Application Submitted','Applied for Backend Developer at Computer Science','2026-03-11 01:17:55.894455','2026-03-11 01:17:55.894461','1e77028f-b421-4408-9627-51bc24860eaa'),
('0bd9bcbe-5a22-4c4b-ace3-ea3b99058a57','status_change',NULL,'test','Application Submitted','Applied for Pakistan Study at Humanities','2026-04-18 16:29:03.217677','2026-04-18 16:29:03.217680','0a592ced-8c84-409f-b4fb-d76766cd0e7c'),
('cd2512eb-cf51-47dd-9d9d-f43971342443','status_change',NULL,'test','Application Submitted','Applied for Machine Learning Engineer at DataSolve Analytics','2026-03-11 01:47:22.850217','2026-03-11 01:47:22.850224','2ba22d4a-51f4-4e0e-b15f-fed600692eda');
/*!40000 ALTER TABLE `application_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` uuid NOT NULL,
  `job_title` varchar(200) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `company_logo_color` varchar(7) NOT NULL,
  `company_logo_initial` varchar(2) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `salary_range` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `interview_type` varchar(20) DEFAULT NULL,
  `interview_date` datetime(6) DEFAULT NULL,
  `interview_notes` longtext DEFAULT NULL,
  `applied_at` datetime(6) NOT NULL,
  `last_status_update` datetime(6) NOT NULL,
  `cover_letter` longtext DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  `notes` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `job_id` uuid DEFAULT NULL,
  `user_id` uuid NOT NULL,
  `offer_deadline` datetime(6) DEFAULT NULL,
  `test_completed_at` datetime(6) DEFAULT NULL,
  `test_score` double DEFAULT NULL,
  `interview_completed_at` datetime(6) DEFAULT NULL,
  `interview_score` double DEFAULT NULL,
  `interview_transcript` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`interview_transcript`)),
  `confidence_score` double DEFAULT NULL,
  `interview_recording_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `applications_job_id_9cc0e7d0_fk_jobs_id` (`job_id`),
  KEY `applications_user_id_ccbebfe7_fk_users_id` (`user_id`),
  CONSTRAINT `applications_job_id_9cc0e7d0_fk_jobs_id` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `applications_user_id_ccbebfe7_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES
('fa113ae5-6da6-47dc-8d3f-195f95b8f9da','Assisstant Professor- Computer Science','Computer Science','#6366f1','','Islamabad','$250000.00k - $300000.00k','reviewing',NULL,NULL,NULL,'2026-04-23 11:24:19.982670','2026-04-23 11:24:19.982677','','','','2026-04-23 11:24:19.982706','2026-04-23 11:50:50.478146','5f7a034e-5d0b-481f-b8b6-c75dd08627d8','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-23 11:31:25.498421',73.33333333333333,'2026-04-23 11:50:50.477923',58.08,'[{\"question\": \"Tell me about a time when you had to adapt your lesson plan due to unexpected student feedback or changes in the curriculum. How did you handle the situation?\", \"answer\": \"So, initially when I started teaching, I used to teach the advanced concepts, but then when I saw that the students were unable to grasp the advanced concept, I started teaching them from the very basics such as HTML, CSS and JavaScript. And then they were easily understanding what I was saying and then after that they were easily understanding the advanced topics. So yeah, I did handle the situation.\", \"scores\": {\"communication\": 5.78, \"relevance\": 5.95, \"technical\": 4.27, \"reasoning\": 4.33, \"total\": 5.34, \"feedback\": \"\"}}, {\"question\": \"What would you do if you noticed that one of your students was struggling with a concept after an entire semester of instruction? How would you support them?\", \"answer\": \"Well, I will arrange some extra classes from them for them if they are interested in learning. And if they are motivated, I will keep them motivated. I will try to teach them everything in simple words with real life inologies so that they understand and they start moving for what. What they want to learn.\", \"scores\": {\"communication\": 6.0, \"relevance\": 6.43, \"technical\": 3.15, \"reasoning\": 4.17, \"total\": 5.33, \"feedback\": \"\"}}, {\"question\": \"Can you describe a project you led in industry and how it relates to your teaching philosophy?\", \"answer\": \"Yes, so I was working on a project, this sounds, it was a 3 months project called Dual Brain Psychology. It was based on psychotherapy for patients using AI and RAG and Langshan. And it was a research based project, so it helped me in teaching and it relates to teaching philosophy.\", \"scores\": {\"communication\": 6.38, \"relevance\": 6.11, \"technical\": 5.5, \"reasoning\": 3.33, \"total\": 5.71, \"feedback\": \"\"}}, {\"question\": \"Why do you want this role as Assistant Professor-Computer Science, and what qualities do you think make you a strong candidate for this position?\", \"answer\": \"I want to show as a assistant professor of computer science because I\'m interested in pursuing the academic fields and I\'m interested in teaching and I\'m interested in learning new things and discovering and exploring new topics and concepts and it makes me a strong candidate for this position because I\'m very much interested in learning new technologies and new concepts.\", \"scores\": {\"communication\": 3.09, \"relevance\": 7.17, \"technical\": 6.13, \"reasoning\": 6.33, \"total\": 5.49, \"feedback\": \"\"}}, {\"question\": \"How do you incorporate hands-on learning experiences into your courses, particularly for students with varying levels of programming experience?\", \"answer\": \"For students, I want to make assignments and quizzes which will give them hands-on experience. They will explore new things because of the assignments and that will be totally exploration-based assignments. And without accept that, I will also give them class activities that will help them in getting a hands-on experience in programming.\", \"scores\": {\"communication\": 6.28, \"relevance\": 6.79, \"technical\": 4.15, \"reasoning\": 4.44, \"total\": 5.78, \"feedback\": \"\"}}, {\"question\": \"What is the most effective way you\'ve seen students learn complex computer science concepts, and how would you implement that in your own teaching practice?\", \"answer\": \"I think students learn when they are interested in it, when they have an interest in that part. So if I can build their interest using class activities and quizzes and also give them practice assignments and lecture materials so that they can cover before coming to the next class so that they are up to date, what are we doing in class? So that\'s why students will have them learn and that would be the most effective way to learn complex computer science concepts.\", \"scores\": {\"communication\": 6.56, \"relevance\": 6.92, \"technical\": 5.93, \"reasoning\": 4.94, \"total\": 6.34, \"feedback\": \"\"}}, {\"question\": \"Can you design an introductory course in Computer Science from scratch, including a clear curriculum outline and potential assessments?\", \"answer\": \"Yeah, sure I can. I can design it and make assignments and wishes and new lecture material from the updated content that what is happening in the tech industry is right now and what is happening in the university is right now. So I can do it.\", \"scores\": {\"communication\": 5.72, \"relevance\": 5.6, \"technical\": 3.43, \"reasoning\": 3.33, \"total\": 4.9, \"feedback\": \"\"}}]',6.37,'http://localhost:8000/media/interviews/64c68989-cfd5-4cb6-89f9-208c1b35e23d_fa113ae5-6da6-47dc-8d3f-195f95b8f9da.webm'),
('bec2b381-28f6-4913-a87f-1c315605d3bc','Django Developer','Computer Sceince','#6366f1','','Lahore','$93000.00k - $117000.00k','rejected',NULL,NULL,NULL,'2026-04-18 16:11:26.346338','2026-04-18 16:11:26.346341','','','','2026-04-18 16:11:26.346350','2026-04-18 16:24:51.596277','1bcc7add-6287-42aa-9d43-674607afed3b','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-18 16:24:51.594838',38,NULL,NULL,'[]',NULL,NULL),
('a600a6fe-62a8-44e1-8873-337d0f6f8e9b','AI Engineer','IntelliCore Technologies','#6366f1','','Islamabad, Pakistan','$2500.00k - $5000.00k','rejected',NULL,NULL,NULL,'2026-03-11 05:16:51.692578','2026-03-11 05:16:51.692585','','','','2026-03-11 05:16:51.692599','2026-03-11 06:39:58.575976','582f35bc-1d09-11f1-8d7e-d310d3f44da4','79e724c2-e159-484b-8869-7a3f09796d66',NULL,'2026-03-11 06:39:58.572340',0,NULL,NULL,'[]',NULL,NULL),
('1051e91a-bcd2-4628-ab9b-3c9152adbd40','Resume Upload','Resume','#6366f1',NULL,NULL,NULL,'reviewing',NULL,NULL,NULL,'2026-04-23 14:44:25.322650','2026-04-23 14:44:25.322657',NULL,'http://localhost:8000/media/resumes/4e842ef8-d69b-4b5d-8861-e87d6ef3f7b4_Dilawar_Resume.pdf',NULL,'2026-04-23 14:44:25.322692','2026-04-23 14:44:25.322995',NULL,'8ab28678-2048-4951-b497-320777e9f0b6',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('96a65aff-b8ef-407d-b5fc-4fb37e49dfad','AI Engineer','IntelliCore Technologies','#6366f1','','Islamabad, Pakistan','$2500.00k - $5000.00k','rejected',NULL,NULL,NULL,'2026-04-18 15:51:26.914691','2026-04-18 15:51:26.914699','','','','2026-04-18 15:51:26.914713','2026-04-18 16:06:20.759836','582f35bc-1d09-11f1-8d7e-d310d3f44da4','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-18 16:06:20.759628',0,NULL,NULL,'[]',NULL,NULL),
('1e77028f-b421-4408-9627-51bc24860eaa','Backend Developer','Computer Science','#6366f1','','Lahore','$100000.00k - $250000.00k','rejected',NULL,NULL,NULL,'2026-03-11 01:17:55.883276','2026-03-11 01:17:55.883283','','','','2026-03-11 01:17:55.883300','2026-03-11 01:26:15.731614','13342d64-6b7c-4056-8cb6-995407a2d852','79e724c2-e159-484b-8869-7a3f09796d66',NULL,'2026-03-11 01:26:15.731535',0,NULL,NULL,'[]',NULL,NULL),
('9358fb61-355f-4c0d-8981-62ea8c23bfbb','WEB DEveloper','CS','#6366f1','','Lahore','$119000.00k - $141000.00k','test',NULL,NULL,NULL,'2026-04-23 14:57:14.634330','2026-04-23 14:57:14.634334','','','','2026-04-23 14:57:14.634347','2026-04-23 14:57:14.634560','a333f0ab-7d3e-4ef9-b409-675c07313ebd','8ab28678-2048-4951-b497-320777e9f0b6',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('b0013b39-ed8d-4b22-996d-76ca4a8e1916','Resume Upload','Resume','#6366f1',NULL,NULL,NULL,'reviewing',NULL,NULL,NULL,'2026-03-11 01:33:06.592820','2026-03-11 01:33:06.592824',NULL,'http://localhost:8000/media/resumes/edd8d880-87a2-4711-b5ff-4263d728ff6e_Bilal_Farooq_Resume.pdf',NULL,'2026-03-11 01:33:06.592828','2026-03-11 01:33:06.592989',NULL,'4c28b6fd-3e0e-4efa-a743-53c5facd168e',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('fe38c5ea-b990-4dc6-b8a1-810598d88d27','Front-end developer and React Expert','Front-end team','#6366f1','','Lahore','$118000.00k - $168000.00k','test',NULL,NULL,NULL,'2026-04-18 19:35:27.741273','2026-04-18 19:35:27.741277','','','','2026-04-18 19:35:27.741292','2026-04-18 19:35:27.741499','28740540-dcbe-4791-bfc0-e4d79728b749','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('54d825bc-7643-4a64-8eb9-96d2e6ff5c78','Web Engineer','CS','#6366f1','','peshawar','$68000.00k - $89000.00k','reviewing',NULL,NULL,NULL,'2026-04-18 19:37:04.605156','2026-04-18 19:37:04.605160','','','','2026-04-18 19:37:04.605170','2026-04-22 16:03:34.965019','8b16c3d8-7c62-4505-853e-7bea65e44786','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-18 19:43:31.002993',53.333333333333336,'2026-04-22 16:03:34.964857',51.08,'[{\"question\": \"Tell me about yourself and why you want to join FAST University as a Web Engineer.\", \"answer\": \"I am a software engineer and I want to join First University as a web engineer because I have studied from there and I am excited in teaching the same concepts that I have learned there.\", \"scores\": {\"communication\": 6.69, \"relevance\": 6.17, \"technical\": 5.49, \"reasoning\": 6.67, \"total\": 6.27, \"feedback\": \"\"}}, {\"question\": \"Describe a challenging situation you faced in your previous role and how you handled it.\", \"answer\": \"Previously I haven\'t been teaching web engineering so therefore there is no situation in my previous role.\", \"scores\": {\"communication\": 5.69, \"relevance\": 3.83, \"technical\": 3.82, \"reasoning\": 7.67, \"total\": 4.96, \"feedback\": \"\"}}, {\"question\": \"How do you keep yourself updated with the latest developments in your field?\", \"answer\": \"I am very much interested in exploring new things so I keep myself updated using LinkedIn and checking out LinkedIn every time and other applications.\", \"scores\": {\"communication\": 4.75, \"relevance\": 4.83, \"technical\": 3.64, \"reasoning\": 3.33, \"total\": 4.37, \"feedback\": \"\"}}, {\"question\": \"What teaching or mentoring experience do you have?\", \"answer\": \"I don\'t have an actual teaching experience but I have both as a teaching assistant for two or three subjects and I have explained multiple things in those T-assitions.\", \"scores\": {\"communication\": 4.89, \"relevance\": 6.04, \"technical\": 2.83, \"reasoning\": 3.33, \"total\": 4.65, \"feedback\": \"\"}}, {\"question\": \"How would you handle a student who is struggling with the course material?\", \"answer\": \"I will try to start from the very basics and explain everything that is easy at first. And we will give him the most of the time and we will give him practice assignments so that he can build up himself.\", \"scores\": {\"communication\": 6.38, \"relevance\": 5.53, \"technical\": 2.96, \"reasoning\": 5.0, \"total\": 5.23, \"feedback\": \"\"}}, {\"question\": \"What specific skills make you a strong candidate for this Web Engineer position?\", \"answer\": \"Well, I have a strong experience in web engineering. I have to discuss from first university and have built an EPLUS grade. Moreover, I have done web development a lot. For example, HTML Cases have created a lot of projects in them. And using Jane was the backend and react as the front end.\", \"scores\": {\"communication\": 6.45, \"relevance\": 5.94, \"technical\": 5.38, \"reasoning\": 4.33, \"total\": 5.78, \"feedback\": \"\"}}, {\"question\": \"Where do you see yourself professionally in the next five years?\", \"answer\": \"I see myself as a teacher in class university after 5 years.\", \"scores\": {\"communication\": 6.25, \"relevance\": 4.97, \"technical\": 3.86, \"reasoning\": 3.33, \"total\": 4.96, \"feedback\": \"\"}}]',4.96,NULL),
('c32588a9-7f56-4a9a-bbde-ae4c06f8858b','PHP developer','Computer Science','#6366f1','','Peshawar','$50000.00k - $60000.00k','interview',NULL,NULL,NULL,'2026-04-24 14:42:26.401929','2026-04-24 14:51:03.647314','','','','2026-04-24 14:42:26.401965','2026-04-24 14:54:05.059028','a6f5a862-2151-4f9f-a914-60b7c635d727','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-24 14:54:05.058951',44.44444444444444,NULL,NULL,'[]',NULL,NULL),
('b47ea96d-62b1-4c5d-ae18-afa9a8f571ed','Software Engineer','TechNova Solutions','#6366f1','','Lahore, Pakistan','$1500.00k - $3000.00k','test',NULL,NULL,NULL,'2026-03-11 04:59:45.468997','2026-03-11 04:59:45.469004','','','','2026-03-11 04:59:45.469018','2026-03-11 04:59:45.474928','7b1cfeb3-1d06-11f1-8f26-d8252e77cc9b','79e724c2-e159-484b-8869-7a3f09796d66',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('01189eff-84ec-479f-9b6b-b726776e0452','Resume Upload','Resume','#6366f1',NULL,NULL,NULL,'reviewing',NULL,NULL,NULL,'2026-03-11 01:27:52.847239','2026-03-11 01:27:52.847244',NULL,'http://localhost:8000/media/resumes/feb0f0bb-e20d-490d-862e-f04c8a8db682_Dilawar_Resume.pdf',NULL,'2026-03-11 01:27:52.847257','2026-03-11 01:27:52.847463',NULL,'79e724c2-e159-484b-8869-7a3f09796d66',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('e559c7b2-6df6-49d5-bdc6-c05e44b3597a','AI/ML Engineer','Artificial Intelligence','#6366f1','','Peshawar','$97000.00k - $124000.00k','reviewing',NULL,NULL,NULL,'2026-04-23 15:07:37.990382','2026-04-23 15:07:37.990386','','','','2026-04-23 15:07:37.990413','2026-04-23 19:12:53.921997','c36c49e8-1ee7-4155-8b48-0e355d3ccb78','8ab28678-2048-4951-b497-320777e9f0b6',NULL,'2026-04-23 15:14:54.705685',66.66666666666666,'2026-04-23 19:12:53.921759',54.94,'[{\"question\": \"Tell me about a time when you applied supervised learning techniques to solve a complex problem in your previous role or personal projects.\", \"answer\": \"I use supervised machine learning in a project where I have to classify the images of cats and dogs. So, I trained a machine learning model based on some level data which has cleared levels of cats and dogs and I trained the model and then I tested with different images of cats and dogs.\", \"scores\": {\"communication\": 6.5, \"relevance\": 4.99, \"technical\": 3.12, \"reasoning\": 3.33, \"total\": 4.9, \"feedback\": \"\"}}, {\"question\": \"How do you evaluate the performance of a machine learning model using metrics such as accuracy, precision, and recall?\", \"answer\": \"I can evaluate the performance of machine-ladding models using these metrics by using the cost function and gradient descent. In gradient descent, I will each time create the cost function and then in the end, I will update the weights of the model according to it.\", \"scores\": {\"communication\": 6.5, \"relevance\": 5.53, \"technical\": 4.63, \"reasoning\": 3.33, \"total\": 5.38, \"feedback\": \"\"}}, {\"question\": \"What is the difference between linear regression and logistic regression, and when would you choose to use each?\", \"answer\": \"Basically the linear regression is used for continuous values while the logistic regression is used for based on classification. It is used for the classification problem when we have output that is restricted to specific classes such as two classes yes or no and one or zero or multiple logistic regression. So we can use linear regression such as for house predictions, predicting continuous values and we can use logistic regression for finding out the classes such as cat class or dog class.\", \"scores\": {\"communication\": 5.01, \"relevance\": 7.19, \"technical\": 4.96, \"reasoning\": 4.0, \"total\": 5.59, \"feedback\": \"\"}}, {\"question\": \"Describe a situation where you had to handle overfitting or underfitting in a machine learning model. How did you address it?\", \"answer\": \"When there was a situation in which my model was all fitting it was giving 100% result on the training data but around 50% to 60% results on test data. So I had to use regularization, normalization and did careful cross testing to fix this issue.\", \"scores\": {\"communication\": 6.5, \"relevance\": 4.64, \"technical\": 3.79, \"reasoning\": 3.33, \"total\": 4.92, \"feedback\": \"\"}}, {\"question\": \"Why do you think linear regression is suitable for modeling relationships between continuous variables, but not for classification problems?\", \"answer\": \"Actually, it is good for finding the continuous values, but not for classification problems because it is very sensitive to the outliers. One outlier can change the entire boundary. The decision boundary can be entirely changed of the linear regression in classification\", \"scores\": {\"communication\": 4.65, \"relevance\": 5.61, \"technical\": 5.05, \"reasoning\": 4.44, \"total\": 5.02, \"feedback\": \"\"}}, {\"question\": \"Tell me about a project where you used transfer learning to adapt a pre-trained model to a new domain. What challenges did you face and how did you overcome them?\", \"answer\": \"actually I transferred, I did transfer learning to adapt a pre-trend model to a new domain when the requirements change and we had a new model and we had to be the transfer learning and specifically I did not encounter any changes and so there was no changes to overcome.\", \"scores\": {\"communication\": 3.96, \"relevance\": 6.6, \"technical\": 5.11, \"reasoning\": 4.33, \"total\": 5.12, \"feedback\": \"\"}}, {\"question\": \"How do you stay current with the latest developments in the field of AI/ML, such as new algorithms or techniques? Can you give an example of something you\'ve learned recently that has improved your work?\", \"answer\": \"I have to date using LinkedIn. A lot of people post about new technologies that come regarding an ML. I have followed pages that follows, that gives information about an ML. And I have also followed YouTube channels that give me such information.\", \"scores\": {\"communication\": 5.92, \"relevance\": 6.04, \"technical\": 4.03, \"reasoning\": 3.33, \"total\": 5.24, \"feedback\": \"\"}}]',6.22,'http://localhost:8000/media/interviews/381e2dba-7848-43fc-85d2-159092d561e0_e559c7b2-6df6-49d5-bdc6-c05e44b3597a.webm'),
('f08ab669-3dd0-4ce7-898a-d0a0b24fbac2','Front-end Developer','Software Engineering','#6366f1','','Peshawar','$71000.00k - $108000.00k','test',NULL,NULL,NULL,'2026-03-11 01:33:36.462036','2026-03-11 01:33:36.462041','','','','2026-03-11 01:33:36.462051','2026-03-11 01:33:36.462256','bd560837-4894-4440-8b23-80a8a436bb28','79e724c2-e159-484b-8869-7a3f09796d66',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL),
('0a592ced-8c84-409f-b4fb-d76766cd0e7c','Pakistan Study','Humanities','#6366f1','','Peshawar','$100000.00k - $120000.00k','reviewing',NULL,NULL,NULL,'2026-04-18 16:29:03.216265','2026-04-18 19:34:39.562827','','','','2026-04-18 16:29:03.216277','2026-04-19 15:22:29.887821','4a787bca-1c3f-4f37-b307-b0d7dcbcf7f7','48ece145-e5a5-46c9-9a90-fb62549b20c3',NULL,'2026-04-18 16:35:54.282943',23.333333333333332,'2026-04-19 15:22:29.887652',50,'[{\"question\": \"Can you describe a challenging situation in your research on Pakistan and how did you handle it?\", \"answer\": \"Hello, my testing 1, 2, 3.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"Tell me about a time when you effectively communicated complex ideas related to Pakistan\'s politics or society to an audience with varying levels of knowledge.\", \"answer\": \"my name is Dilawer Khan and I\'m currently in first news special campus\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"What motivates you to continue exploring the complexities of Pakistan in your academic pursuits?\", \"answer\": \"I am expert in Pakistan Studies.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"How would you approach teaching a student who is new to the subject and lacks a solid understanding of Pakistan\'s history and culture?\", \"answer\": \"I will try my best to teach him the complex objects.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"Describe your experience working with diverse groups of people, including students, colleagues, and community members, on projects related to Pakistan Studies.\", \"answer\": \"I have done no projects on Pakistan Studies yet.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"What do you believe are the most significant misconceptions about Pakistan in the academic or general public discourse, and how would you address them in your research or teaching?\", \"answer\": \"I don\'t know.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}, {\"question\": \"How do you stay current with developments in Pakistan, and what sources do you rely on for staying informed about the country\'s politics, society, and culture?\", \"answer\": \"I have no idea.\", \"scores\": {\"communication\": 5, \"relevance\": 5, \"confidence\": 5, \"reasoning\": 5, \"technical\": 5, \"total\": 5.0, \"feedback\": \"Could not evaluate answer.\"}}]',NULL,NULL),
('2ba22d4a-51f4-4e0e-b15f-fed600692eda','Machine Learning Engineer','DataSolve Analytics','#6366f1',NULL,'Lahore, Pakistan','$220000.00k - $400000.00k','test',NULL,NULL,NULL,'2026-03-11 01:47:22.844693','2026-03-11 01:47:22.844705','','','','2026-03-11 01:47:22.844721','2026-03-11 01:47:22.845963','73edea20-2f48-420c-a507-f81f7340b54d','4c28b6fd-3e0e-4efa-a743-53c5facd168e',NULL,NULL,NULL,NULL,NULL,'[]',NULL,NULL);
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES
(1,'Can add log entry',1,'add_logentry'),
(2,'Can change log entry',1,'change_logentry'),
(3,'Can delete log entry',1,'delete_logentry'),
(4,'Can view log entry',1,'view_logentry'),
(5,'Can add permission',3,'add_permission'),
(6,'Can change permission',3,'change_permission'),
(7,'Can delete permission',3,'delete_permission'),
(8,'Can view permission',3,'view_permission'),
(9,'Can add group',2,'add_group'),
(10,'Can change group',2,'change_group'),
(11,'Can delete group',2,'delete_group'),
(12,'Can view group',2,'view_group'),
(13,'Can add user',4,'add_user'),
(14,'Can change user',4,'change_user'),
(15,'Can delete user',4,'delete_user'),
(16,'Can view user',4,'view_user'),
(17,'Can add content type',5,'add_contenttype'),
(18,'Can change content type',5,'change_contenttype'),
(19,'Can delete content type',5,'delete_contenttype'),
(20,'Can view content type',5,'view_contenttype'),
(21,'Can add session',6,'add_session'),
(22,'Can change session',6,'change_session'),
(23,'Can delete session',6,'delete_session'),
(24,'Can view session',6,'view_session'),
(25,'Can add application',7,'add_application'),
(26,'Can change application',7,'change_application'),
(27,'Can delete application',7,'delete_application'),
(28,'Can view application',7,'view_application'),
(29,'Can add company',10,'add_company'),
(30,'Can change company',10,'change_company'),
(31,'Can delete company',10,'delete_company'),
(32,'Can view company',10,'view_company'),
(33,'Can add user',16,'add_user'),
(34,'Can change user',16,'change_user'),
(35,'Can delete user',16,'delete_user'),
(36,'Can view user',16,'view_user'),
(37,'Can add application timeline',8,'add_applicationtimeline'),
(38,'Can change application timeline',8,'change_applicationtimeline'),
(39,'Can delete application timeline',8,'delete_applicationtimeline'),
(40,'Can view application timeline',8,'view_applicationtimeline'),
(41,'Can add job',12,'add_job'),
(42,'Can change job',12,'change_job'),
(43,'Can delete job',12,'delete_job'),
(44,'Can view job',12,'view_job'),
(45,'Can add education',11,'add_education'),
(46,'Can change education',11,'change_education'),
(47,'Can delete education',11,'delete_education'),
(48,'Can view education',11,'view_education'),
(49,'Can add work experience',18,'add_workexperience'),
(50,'Can change work experience',18,'change_workexperience'),
(51,'Can delete work experience',18,'delete_workexperience'),
(52,'Can view work experience',18,'view_workexperience'),
(53,'Can add saved job',15,'add_savedjob'),
(54,'Can change saved job',15,'change_savedjob'),
(55,'Can delete saved job',15,'delete_savedjob'),
(56,'Can view saved job',15,'view_savedjob'),
(57,'Can add user skill',17,'add_userskill'),
(58,'Can change user skill',17,'change_userskill'),
(59,'Can delete user skill',17,'delete_userskill'),
(60,'Can view user skill',17,'view_userskill'),
(61,'Can add certificate',9,'add_certificate'),
(62,'Can change certificate',9,'change_certificate'),
(63,'Can delete certificate',9,'delete_certificate'),
(64,'Can view certificate',9,'view_certificate'),
(65,'Can add project',13,'add_project'),
(66,'Can change project',13,'change_project'),
(67,'Can delete project',13,'delete_project'),
(68,'Can view project',13,'view_project'),
(69,'Can add research',14,'add_research'),
(70,'Can change research',14,'change_research'),
(71,'Can delete research',14,'delete_research'),
(72,'Can view research',14,'view_research');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` uuid NOT NULL,
  `name` varchar(200) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `logo_color` varchar(7) NOT NULL,
  `logo_initial` varchar(2) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `company_size` varchar(50) DEFAULT NULL,
  `website_url` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES
('eddd807b-2eed-4d2b-804e-1cb22fffe835','TechNova Solutions',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.780827','2026-03-10 19:56:41.780994'),
('4dffd88b-2972-4c94-b428-5e055e552ee0','CloudWorks Inc.',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.783539','2026-03-10 19:56:41.783713'),
('b9bf3ae5-961c-45bf-8ccd-690ec1d1cfee','DataSolve Analytics',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.786942','2026-03-10 19:56:41.787026'),
('90ea8c85-3805-471a-9bf7-8cdf7f5ef078','NextGen Web Solutions',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.790378','2026-03-10 19:56:41.790485'),
('ebd8cc8d-7fb1-404d-a238-9c72226cf59f','NextGen Solutions',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.791667','2026-03-10 19:56:41.791757'),
('75b0ac73-94da-43e8-990f-bd10de62f1ed','FinTech Innovators',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.785677','2026-03-10 19:56:41.785773'),
('057b20d4-c94b-45a5-b41f-fe4717aedfa4','SkyHigh Technologies',NULL,'#6366f1',NULL,NULL,NULL,NULL,NULL,'2026-03-10 19:56:41.792995','2026-03-10 19:56:41.793080');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES
(1,'admin','logentry'),
(2,'auth','group'),
(3,'auth','permission'),
(4,'auth','user'),
(5,'contenttypes','contenttype'),
(7,'myapi','application'),
(8,'myapi','applicationtimeline'),
(9,'myapi','certificate'),
(10,'myapi','company'),
(11,'myapi','education'),
(12,'myapi','job'),
(13,'myapi','project'),
(14,'myapi','research'),
(15,'myapi','savedjob'),
(16,'myapi','user'),
(17,'myapi','userskill'),
(18,'myapi','workexperience'),
(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES
(1,'contenttypes','0001_initial','2026-03-05 11:01:23.688646'),
(2,'auth','0001_initial','2026-03-05 11:01:23.798083'),
(3,'admin','0001_initial','2026-03-05 11:01:23.821617'),
(4,'admin','0002_logentry_remove_auto_add','2026-03-05 11:01:23.826474'),
(5,'admin','0003_logentry_add_action_flag_choices','2026-03-05 11:01:23.832206'),
(6,'contenttypes','0002_remove_content_type_name','2026-03-05 11:01:23.855256'),
(7,'auth','0002_alter_permission_name_max_length','2026-03-05 11:01:23.868037'),
(8,'auth','0003_alter_user_email_max_length','2026-03-05 11:01:23.877520'),
(9,'auth','0004_alter_user_username_opts','2026-03-05 11:01:23.882230'),
(10,'auth','0005_alter_user_last_login_null','2026-03-05 11:01:23.894183'),
(11,'auth','0006_require_contenttypes_0002','2026-03-05 11:01:23.895010'),
(12,'auth','0007_alter_validators_add_error_messages','2026-03-05 11:01:23.899470'),
(13,'auth','0008_alter_user_username_max_length','2026-03-05 11:01:23.908734'),
(14,'auth','0009_alter_user_last_name_max_length','2026-03-05 11:01:23.920607'),
(15,'auth','0010_alter_group_name_max_length','2026-03-05 11:01:23.930123'),
(16,'auth','0011_update_proxy_permissions','2026-03-05 11:01:23.934297'),
(17,'auth','0012_alter_user_first_name_max_length','2026-03-05 11:01:23.943714'),
(18,'myapi','0001_initial','2026-03-05 11:01:24.149184'),
(19,'myapi','0002_remove_notification_related_application_and_more','2026-03-05 11:01:24.261059'),
(20,'myapi','0003_application_offer_deadline','2026-03-05 11:01:24.271174'),
(21,'myapi','0004_user_is_onboarded','2026-03-05 11:01:24.284275'),
(22,'myapi','0005_certificate_project_research','2026-03-05 11:01:24.339772'),
(23,'myapi','0006_alter_user_avatar_url','2026-03-05 11:01:24.355670'),
(24,'myapi','0007_alter_user_avatar_url_jobeducationrequirement_and_more','2026-03-05 11:01:24.450530'),
(25,'myapi','0008_remove_jobexperiencerequirement_job_and_more','2026-03-05 11:01:24.637696'),
(26,'myapi','0009_hr_models','2026-03-05 11:01:24.638531'),
(27,'myapi','0010_drop_hr_models','2026-03-05 11:01:24.639191'),
(28,'sessions','0001_initial','2026-03-05 11:01:24.649297'),
(29,'myapi','0011_job_test_deadline_days_job_test_no_of_questions_and_more','2026-03-06 16:56:48.802613'),
(30,'myapi','0012_application_test_completed_at_application_test_score','2026-03-07 15:50:20.707116'),
(31,'myapi','0013_add_test_started_at_to_application','2026-03-10 16:17:10.813335'),
(32,'myapi','0014_remove_application_test_started_at','2026-03-10 16:17:10.828936'),
(33,'myapi','0015_user_interview_recording_url_user_resume_url','2026-03-10 16:17:10.850361'),
(34,'myapi','0016_add_interview_fields_to_application','2026-04-18 19:31:45.915790'),
(35,'myapi','0017_add_confidence_score_to_application','2026-04-22 08:28:35.972873'),
(36,'myapi','0018_add_interview_recording_url_to_application','2026-04-22 18:14:37.759431');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education`
--

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `id` uuid NOT NULL,
  `degree` varchar(200) NOT NULL,
  `school` varchar(200) NOT NULL,
  `field_of_study` varchar(200) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `education_user_id_349e54a8_fk_users_id` (`user_id`),
  CONSTRAINT `education_user_id_349e54a8_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education`
--

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES
('4b9e03e3-5697-4e36-b944-063cc171ffe3','FSC','Concordia College Nowshera, KP',NULL,'2026-03-11',NULL,0,NULL,'Dates: 2020-2022\nFSc. Pre-Engineering Sept. 2020 – May 2022','2026-03-11 01:31:03.411007','2026-03-11 01:31:03.412528','79e724c2-e159-484b-8869-7a3f09796d66'),
('928c516f-1213-4b99-8194-0d4e7dc2a8ed','Bachelor of Software Engineering Aug. 2022 – June 2026','Concordia College Nowshera, KP',NULL,'2026-03-10',NULL,0,NULL,'Dates: \nFSc. Pre-Engineering Sept. 2020 – May 2022','2026-03-10 20:43:44.686742','2026-03-10 20:43:44.686820','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('40210c77-d529-47f2-aed2-1649bf9f622b','F AST NUCES Peshawar, KP','Institution',NULL,'2026-03-07',NULL,0,NULL,'Dates: \n','2026-03-07 21:16:32.513536','2026-03-07 21:16:32.513765','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('79e5fcc5-a893-4c01-ab54-54ce12bbe348','National University of Computer and Emerging','Institution',NULL,'2026-03-11',NULL,0,NULL,'Dates: \n','2026-03-11 01:33:18.649820','2026-03-11 01:33:18.649925','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('71cf17ad-271f-4285-9782-637eceab365e','FSc. Pre-Engineering','Concordia College Nowshera, KPK',NULL,'2026-04-23',NULL,0,NULL,'Dates: Sept. 2020 – May 2022\nFSc. Pre-Engineering Sept. 2020 – May 2022','2026-04-23 14:55:19.874175','2026-04-23 14:55:19.874286','8ab28678-2048-4951-b497-320777e9f0b6'),
('c53757d5-683b-4084-8328-8b7d85daa08d','Bachelor of Software Engineering Aug. 2022 – June 2026','Concordia College Nowshera, KP',NULL,'2026-03-07',NULL,0,NULL,'Dates: \nFSc. Pre-Engineering Sept. 2020 – May 2022','2026-03-07 21:16:32.514586','2026-03-07 21:16:32.514741','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('86b1aabc-c23c-40da-8079-9990b0de86b7','Bachelor of Software Engineering ','FAST NUCES Peshawar, KPK',NULL,'2026-04-23',NULL,0,NULL,'Dates: Aug. 2022 – June 2026\n','2026-04-23 14:55:19.873308','2026-04-23 14:55:19.873460','8ab28678-2048-4951-b497-320777e9f0b6'),
('a932f3ed-1e7c-4264-bf1f-aa8aba043dd0','FAST NUCES Peshawar, KP','Institution',NULL,'2026-03-10',NULL,0,NULL,'Dates: \n','2026-03-10 20:43:44.685850','2026-03-10 20:43:44.686194','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('1a4c4d20-eb35-4a60-8be2-d7437b6451f7','Bachelor of Software Engineering Aug. 2022 – June 2026','FAST NUCES',NULL,'2026-03-11',NULL,0,NULL,'Dates: 2022-2026\n','2026-03-11 01:31:03.404308','2026-03-11 01:31:03.406820','79e724c2-e159-484b-8869-7a3f09796d66');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` uuid NOT NULL,
  `title` varchar(200) NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `location` varchar(200) NOT NULL,
  `description` longtext NOT NULL,
  `job_type` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`job_type`)),
  `work_mode` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`work_mode`)),
  `salary_min` decimal(10,2) DEFAULT NULL,
  `salary_max` decimal(10,2) DEFAULT NULL,
  `salary_currency` varchar(3) NOT NULL,
  `requirements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`requirements`)),
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `benefits` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`benefits`)),
  `is_remote` tinyint(1) NOT NULL,
  `posted_date` datetime(6) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `source_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `company_id` uuid DEFAULT NULL,
  `selection_process` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`selection_process`)),
  `test_deadline_days` int(11) DEFAULT NULL,
  `test_no_of_questions` int(11) DEFAULT NULL,
  `test_time_allowed` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_company_id_ded082d2_fk_companies_id` (`company_id`),
  CONSTRAINT `jobs_company_id_ded082d2_fk_companies_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES
('c36c49e8-1ee7-4155-8b48-0e355d3ccb78','AI/ML Engineer','Artificial Intelligence','Peshawar','We want an AI/ML engineer for work in our university.','[\"Part-time\"]','[]',97000.00,124000.00,'USD','[\"Masters in Artificial Intelligence\", \"have basic knowledge of AI\", \"knows supervised learning\", \"knows linear regression\"]','[]','[]',0,'2026-03-07 14:55:03.373282','2026-03-03 00:00:00.000000',NULL,1,'2026-03-07 14:55:03.373333','2026-03-07 20:57:14.757842',NULL,'[]',3,15,60),
('b1a068a6-14bf-400b-9f75-25605643716e','Software Engineer - Backend','NextGen Solutions','Karachi, Pakistan','NextGen Solutions is seeking a Software Engineer to develop backend systems for scalable web and mobile applications. The role involves building REST APIs, optimizing database queries, and collaborating with frontend engineers and product teams.','[\"Full-time\"]','[\"Onsite\"]',160000.00,280000.00,'PKR','[\"BS in Computer Science or related field\", \"2+ years backend development experience with Python or Java\", \"Experience with Django, Flask, or Node.js\", \"Proficient in relational databases (PostgreSQL/MySQL)\", \"Knowledge of RESTful API design principles\", \"Familiarity with Git and CI/CD pipelines\", \"Strong problem-solving and analytical skills\"]','[\"Develop backend services and APIs\", \"Optimize database queries and application performance\", \"Write automated tests and maintain code quality\", \"Collaborate with frontend and QA teams\", \"Participate in code reviews and technical discussions\"]','[\"Health insurance benefits\", \"Performance-based bonuses\", \"Professional development and certifications\", \"Collaborative team environment\"]',0,'2026-03-10 19:56:41.808061',NULL,NULL,1,'2026-03-10 19:56:41.808654','2026-03-10 19:56:41.808830','ebd8cc8d-7fb1-404d-a238-9c72226cf59f','[\"Resume Screening\", \"Technical Assessment: 60-minute backend coding test\", \"Technical Interview with Engineering Lead\", \"Culture Fit Interview\", \"Offer communicated within 5 business days\"]',3,100,60),
('41a1e44b-7060-4ad6-a714-41a77539e814','PHP Developer','Computer Science','Peshawar','We need a PHP developer.','[\"Part-time\"]','[]',100000.00,2500000.00,'USD','[\"3 years of experience in php\"]','[]','[]',0,'2026-03-10 20:26:53.972301','2026-03-13 00:00:00.000000',NULL,1,'2026-03-10 20:26:53.972324','2026-03-10 20:26:53.984516',NULL,'[]',3,10,60),
('70f34444-8297-4bc3-87bc-4861bed90114','ABC','DEF','GHI','KLM','[\"Contract\"]','[]',78000.00,109000.00,'USD','[\"NOP\", \"QRS\", \"TUV\", \"WXY\"]','[]','[]',0,'2026-03-06 17:24:24.307591','2026-03-05 00:00:00.000000',NULL,1,'2026-03-06 17:24:24.307618','2026-03-07 20:57:14.762231',NULL,'[]',3,100,60),
('54c58ae7-112b-4e31-940c-4e952d0ff7b7','Software Engineer','TechNova Solutions','Lahore, Pakistan','TechNova Solutions is seeking a talented and motivated Software Engineer to join our growing engineering team. The successful candidate will be responsible for designing, developing, testing, and maintaining scalable web applications and backend systems.\n\nThe role requires strong analytical thinking and problem-solving skills, along with the ability to work in a collaborative development environment. The candidate will work closely with product managers, designers, and other developers to deliver high-quality software solutions that address real-world business challenges.\n\nKey responsibilities include developing RESTful APIs, integrating databases, implementing efficient backend logic, and optimizing application performance. The engineer will also participate in code reviews, debugging, testing, and improving software quality.\n\nThis position provides an excellent opportunity to work with modern technologies, contribute to impactful software products, and grow professionally in a dynamic and innovative technology environment.','[\"Full-time\"]','[\"Hybrid\"]',1500.00,3000.00,'USD','[\"Bachelor\\u2019s degree in Computer Science, Software Engineering, or a related technical field\", \"Strong understanding of programming fundamentals including data structures and algorithms\", \"Experience with programming languages such as Python, Java, or JavaScript\", \"Hands-on experience with web frameworks such as Django, Flask, Node.js, or Spring Boot\", \"Experience designing and implementing RESTful APIs\", \"Familiarity with relational databases such as MySQL or PostgreSQL\", \"Experience using Git and version control systems\", \"Understanding of software development lifecycle and agile development methodologies\", \"Knowledge of debugging, testing, and performance optimization techniques\", \"Basic knowledge of cloud platforms such as AWS, Azure, or Google Cloud is considered a plus\", \"Strong problem-solving and analytical thinking abilities\", \"Good communication skills and ability to work effectively within a development team\"]','[\"Design and develop scalable backend services and web applications\", \"Write clean, maintainable, and efficient code following best practices\", \"Develop and maintain RESTful APIs for frontend and third-party integrations\", \"Collaborate with cross-functional teams including designers and product managers\", \"Debug, troubleshoot, and resolve software issues\", \"Optimize application performance and scalability\", \"Participate in code reviews and technical discussions\", \"Contribute to improving development processes and system architecture\"]','[\"Competitive salary package\", \"Health insurance coverage\", \"Flexible working hours\", \"Hybrid work opportunities\", \"Paid annual and sick leave\", \"Professional development and training programs\"]',1,'2026-03-11 04:50:39.595685','2026-03-15 23:59:59.000000',NULL,1,'2026-03-11 04:50:39.597009','2026-03-11 04:50:39.611945',NULL,'[\"Online application submission\", \"Online technical assessment test\", \"Technical interview with engineering team\", \"Final HR interview\"]',3,20,15),
('a6f5a862-2151-4f9f-a914-60b7c635d727','PHP developer','Computer Science','Peshawar','We need a PHP Developer','[\"Full-time\"]','[]',50000.00,60000.00,'USD','[\"PHP\"]','[]','[]',0,'2026-03-07 22:04:10.869536','2026-03-08 00:00:00.000000',NULL,1,'2026-03-07 22:04:10.869571','2026-03-07 22:04:10.873133',NULL,'[]',2,9,10),
('129caf9d-0dfe-4bac-b172-64f893a6b7cc','Software Engineer','TechNova Solutions','Lahore, Pakistan','TechNova Solutions is seeking a talented and motivated Software Engineer to join our growing engineering team. The successful candidate will be responsible for designing, developing, testing, and maintaining scalable web applications and backend systems.\n\nThe role requires strong analytical thinking and problem-solving skills, along with the ability to work in a collaborative development environment. The candidate will work closely with product managers, designers, and other developers to deliver high-quality software solutions that address real-world business challenges.\n\nKey responsibilities include developing RESTful APIs, integrating databases, implementing efficient backend logic, and optimizing application performance. The engineer will also participate in code reviews, debugging, testing, and improving software quality.\n\nThis position provides an excellent opportunity to work with modern technologies, contribute to impactful software products, and grow professionally in a dynamic and innovative technology environment.','[\"Full-time\"]','[\"Hybrid\"]',1500.00,3000.00,'USD','[\"Bachelor\\u2019s degree in Computer Science, Software Engineering, or a related technical field\", \"Strong understanding of programming fundamentals including data structures and algorithms\", \"Experience with programming languages such as Python, Java, or JavaScript\", \"Hands-on experience with web frameworks such as Django, Flask, Node.js, or Spring Boot\", \"Experience designing and implementing RESTful APIs\", \"Familiarity with relational databases such as MySQL or PostgreSQL\", \"Experience using Git and version control systems\", \"Understanding of software development lifecycle and agile development methodologies\", \"Knowledge of debugging, testing, and performance optimization techniques\", \"Basic knowledge of cloud platforms such as AWS, Azure, or Google Cloud is considered a plus\", \"Strong problem-solving and analytical thinking abilities\", \"Good communication skills and ability to work effectively within a development team\"]','[\"Design and develop scalable backend services and web applications\", \"Write clean, maintainable, and efficient code following best practices\", \"Develop and maintain RESTful APIs for frontend and third-party integrations\", \"Collaborate with cross-functional teams including designers and product managers\", \"Debug, troubleshoot, and resolve software issues\", \"Optimize application performance and scalability\", \"Participate in code reviews and technical discussions\", \"Contribute to improving development processes and system architecture\"]','[\"Competitive salary package\", \"Health insurance coverage\", \"Flexible working hours\", \"Hybrid work opportunities\", \"Paid annual and sick leave\", \"Professional development and training programs\"]',1,'2026-03-11 04:49:45.200587','2026-03-15 23:59:59.000000',NULL,1,'2026-03-11 04:49:45.201757','2026-03-11 04:49:45.237942',NULL,'[\"Online application submission\", \"Online technical assessment test\", \"Technical interview with engineering team\", \"Final HR interview\"]',3,20,15),
('1bcc7add-6287-42aa-9d43-674607afed3b','Django Developer','Computer Sceince','Lahore','Must be good at developement','[\"Part-time\"]','[]',93000.00,117000.00,'USD','[\"10 years of experience in Django\", \"knows web dev\", \"knows ML/AI\"]','[]','[]',0,'2026-03-06 16:59:10.207897','2026-03-02 00:00:00.000000',NULL,1,'2026-03-06 16:59:10.208096','2026-03-07 20:57:14.763450',NULL,'[]',10,50,45),
('a333f0ab-7d3e-4ef9-b409-675c07313ebd','WEB DEveloper','CS','Lahore','We want a web developer for our company','[\"Full-time\"]','[]',119000.00,141000.00,'USD','[\"html\", \"css\", \"javascript\"]','[]','[]',0,'2026-03-05 14:19:31.809061','2026-03-11 00:00:00.000000',NULL,1,'2026-03-05 14:19:31.809090','2026-03-07 20:57:14.764503',NULL,'[]',3,100,60),
('77995a41-2616-43fc-83d5-726555ebf106','English Professor','Humanities','Remote','The professor should be good in eglish.','[\"Contract\"]','[]',147000.00,190000.00,'USD','[\"Must have 3 years of experience in English Teaching\", \"Should have PHD in English\"]','[]','[]',0,'2026-03-07 16:12:19.809378','2026-03-12 00:00:00.000000',NULL,1,'2026-03-07 16:12:19.809414','2026-03-07 20:57:14.755402',NULL,'[]',3,20,60),
('8b16c3d8-7c62-4505-853e-7bea65e44786','Web Engineer','CS','peshawar','we want a web engineer ','[\"Full-time\"]','[]',68000.00,89000.00,'USD','[\"html\", \"css\", \"javascript\", \"php\"]','[]','[]',0,'2026-03-07 17:39:43.600542','2026-03-13 00:00:00.000000',NULL,1,'2026-03-07 17:39:43.600628','2026-03-07 20:57:14.753338',NULL,'[]',3,15,10),
('bd560837-4894-4440-8b23-80a8a436bb28','Front-end Developer','Software Engineering','Peshawar','We need a Front-end Developer to teach Web-Engineering Course','[\"Part-time\"]','[]',71000.00,108000.00,'USD','[\"2 years of experience in HTML\", \"CSS\", \"JavaScript and React\", \"should also have Idea about php.\"]','[]','[]',0,'2026-03-07 15:56:27.427763','2026-03-21 00:00:00.000000',NULL,1,'2026-03-07 15:56:27.427800','2026-03-07 20:57:14.756500',NULL,'[]',3,25,5),
('781121a8-b06a-4301-96c9-837ad5d217d6','Frontend Developer','NextGen Web Solutions','Karachi, Pakistan','NextGen Web Solutions is seeking a creative Frontend Developer to craft responsive, user-friendly web applications. You will work closely with UX/UI designers and backend engineers to deliver seamless user experiences using modern JavaScript frameworks.','[\"Full-time\"]','[\"Hybrid\"]',140000.00,220000.00,'PKR','[\"BS/MS in Computer Science or related field\", \"2+ years experience with React, Angular, or Vue.js\", \"Strong HTML, CSS, and JavaScript skills\", \"Familiarity with REST APIs and AJAX\", \"Experience with version control (Git)\", \"Basic understanding of backend integration\", \"Knowledge of responsive and accessible design principles\"]','[\"Develop dynamic and interactive web pages\", \"Implement UI designs and responsive layouts\", \"Collaborate with backend developers to consume APIs\", \"Optimize performance and maintain code quality\", \"Participate in code reviews and agile ceremonies\"]','[\"Flexible hybrid working options\", \"Health insurance coverage\", \"Learning and development budget\", \"Collaborative team culture\"]',1,'2026-03-10 19:56:41.806232',NULL,NULL,1,'2026-03-10 19:56:41.806842','2026-03-10 19:56:41.807011','90ea8c85-3805-471a-9bf7-8cdf7f5ef078','[\"Resume Review\", \"Technical Assessment: 60-minute front-end challenge\", \"Technical Interview with Engineering Lead\", \"Culture Fit Interview\", \"Offer communicated within 5 business days\"]',3,80,60),
('13342d64-6b7c-4056-8cb6-995407a2d852','Backend Developer','Computer Science','Lahore','We need a backend developer for our industry','[\"Part-time\"]','[]',100000.00,250000.00,'USD','[\"Masters in Software Engineering\", \"php\", \"node.js\", \"next.js\", \"express\", \"react\"]','[]','[]',0,'2026-03-11 01:17:36.503973','2026-03-19 00:00:00.000000',NULL,1,'2026-03-11 01:17:36.504012','2026-03-11 01:17:36.505355',NULL,'[]',3,10,30),
('0bc92ac9-b13e-4a37-ae96-a195e7b9f121','Full Stack Developer','TechNova Solutions','Karachi, Pakistan','TechNova Solutions is seeking a skilled Full Stack Developer to build scalable web applications and internal tools. You will work on front-end technologies like React and backend APIs using Django and Node.js. This role offers collaboration with product managers, UX designers, and global engineering teams to deliver high-quality software solutions.','[\"Full-time\"]','[\"Hybrid\"]',180000.00,300000.00,'PKR','[\"BS/MS in Computer Science, Software Engineering, or related field\", \"3+ years experience with Django, Python, or Node.js\", \"Proficiency in React, Angular, or Vue.js\", \"Experience designing RESTful APIs and microservices\", \"Knowledge of relational databases (MySQL/PostgreSQL) and ORM\", \"Hands-on experience with version control (Git) and CI/CD pipelines\", \"Familiarity with cloud platforms like AWS or Azure\", \"Strong problem-solving and analytical skills\"]','[\"Develop, maintain, and enhance full stack web applications\", \"Collaborate with frontend engineers, product managers, and designers\", \"Build APIs to support scalable applications\", \"Implement best practices for code quality and testing\", \"Participate in code reviews and mentoring junior developers\", \"Contribute to system design discussions\"]','[\"Flexible hybrid work environment\", \"Health insurance coverage\", \"Annual performance bonuses\", \"Learning & development budget\", \"Collaborative work culture with global teams\"]',1,'2026-03-10 19:56:41.795018',NULL,NULL,1,'2026-03-10 19:56:41.796293','2026-03-10 19:56:41.796646','eddd807b-2eed-4d2b-804e-1cb22fffe835','[\"Resume Review: 3-5 business days\", \"Phone Interview: 30 minutes with HR\", \"Technical Assessment: 90-minute coding test\", \"Technical Interview: 45-minute deep dive\", \"Final Panel: 1-hour discussion covering culture and system design\", \"Offer communicated within 5 business days\"]',5,100,90),
('422356cf-f353-4005-b467-b05da58d9a1b','DevOps Engineer','CloudWorks Inc.','Lahore, Pakistan','CloudWorks Inc. is looking for a talented DevOps Engineer to maintain CI/CD pipelines, manage cloud infrastructure, and ensure application reliability. You will work with AWS, Docker, Kubernetes, and monitoring tools to automate deployments and scale services efficiently.','[\"Full-time\"]','[\"Hybrid\"]',200000.00,350000.00,'PKR','[\"BS/MS in Computer Science, IT, or related field\", \"3+ years experience in DevOps or Site Reliability Engineering\", \"Hands-on experience with AWS, Docker, Kubernetes, Terraform\", \"Familiarity with CI/CD pipelines (Jenkins, GitHub Actions)\", \"Monitoring and logging experience (Prometheus, ELK Stack)\", \"Scripting skills in Python, Bash, or Go\", \"Strong problem-solving and troubleshooting skills\"]','[\"Design and manage scalable cloud infrastructure\", \"Automate deployment pipelines and CI/CD workflows\", \"Monitor system health and implement proactive fixes\", \"Ensure security and compliance across infrastructure\", \"Collaborate with development and QA teams\", \"Document systems and best practices for internal teams\"]','[\"Health and dental coverage\", \"Remote and hybrid work options\", \"Annual performance bonuses\", \"Learning and certification allowances\", \"Team building and wellness programs\"]',1,'2026-03-10 19:56:41.799104',NULL,NULL,1,'2026-03-10 19:56:41.800112','2026-03-10 19:56:41.800364','4dffd88b-2972-4c94-b428-5e055e552ee0','[\"Application Review: 3-5 days\", \"Technical Phone Screen: 30 minutes\", \"Hands-on Technical Test: 90 minutes\", \"Technical Interview: 1 hour with DevOps leads\", \"Final HR Interview and Offer Stage\"]',3,100,60),
('4a787bca-1c3f-4f37-b307-b0d7dcbcf7f7','Pakistan Study','Humanities','Peshawar','We need a Pakistan Studies Teacher for FAST University','[\"Full-time\"]','[]',100000.00,120000.00,'USD','[\"PHD in Pakistan Studies\"]','[]','[]',0,'2026-03-07 21:00:28.498021','2026-03-14 00:00:00.000000',NULL,1,'2026-03-07 21:00:28.498058','2026-03-07 21:00:28.500442',NULL,'[]',10,30,60),
('42c09912-a7a1-4b81-ac73-c154a3db5337','Python Backend Developer','FinTech Innovators','Islamabad, Pakistan','FinTech Innovators is hiring a Python Backend Developer to build robust and secure APIs for financial applications. The role involves collaborating with cross-functional teams, optimizing performance, and maintaining high-quality code for scalable enterprise systems.','[\"Full-time\"]','[\"Onsite\"]',150000.00,250000.00,'PKR','[\"BS in Computer Science or related field\", \"2+ years of backend development experience using Python\", \"Experience with Django, Flask, or FastAPI\", \"Proficiency with PostgreSQL or MySQL\", \"Knowledge of caching mechanisms (Redis, Memcached)\", \"Understanding of RESTful API design and microservices\", \"Familiarity with Git and CI/CD workflows\"]','[\"Develop backend APIs and microservices\", \"Optimize database queries and system performance\", \"Write automated unit and integration tests\", \"Collaborate with frontend and QA teams\", \"Troubleshoot production issues\", \"Document API endpoints and internal processes\"]','[\"Health insurance benefits\", \"Professional training budget\", \"Annual performance bonuses\", \"Collaborative work environment\", \"Flexible leave policy\"]',0,'2026-03-10 19:56:41.801549',NULL,NULL,1,'2026-03-10 19:56:41.802441','2026-03-10 19:56:41.802698','75b0ac73-94da-43e8-990f-bd10de62f1ed','[\"Resume Screening\", \"Technical Assessment: Python coding test\", \"Technical Interview: 45 minutes\", \"Managerial Interview: 30 minutes\", \"Offer Stage within 5 business days\"]',3,80,60),
('5f7a034e-5d0b-481f-b8b6-c75dd08627d8','Assisstant Professor- Computer Science','Computer Science','Islamabad','We need a Assisstant professor for computer science who can teach the students of bachelors and masters. ','[\"Full-time\"]','[]',250000.00,300000.00,'USD','[\"PHD in Computer Science\", \"3 years of teaching experience\", \"1 year of industry experience\"]','[]','[]',0,'2026-04-23 11:23:38.664020','2026-04-28 00:00:00.000000',NULL,1,'2026-04-23 11:23:38.664059','2026-04-23 11:23:38.668627',NULL,'[]',3,15,60),
('582f35bc-1d09-11f1-8d7e-d310d3f44da4','AI Engineer','IntelliCore Technologies','Islamabad, Pakistan','IntelliCore Technologies is looking for a highly motivated AI Engineer to design, develop, and deploy intelligent systems powered by machine learning and artificial intelligence. The candidate will work closely with data scientists, software engineers, and product teams to build AI-driven solutions that improve automation, decision-making, and user experience.\n\nThe AI Engineer will be responsible for developing machine learning models, optimizing algorithms, and integrating AI solutions into production environments. The role also involves working with large datasets, implementing model pipelines, and improving model performance through continuous evaluation and experimentation.\n\nThe ideal candidate should have strong programming skills, knowledge of machine learning frameworks, and the ability to solve complex problems using data-driven approaches. This position offers an exciting opportunity to work on cutting-edge AI technologies and contribute to innovative products.','[\"Full-time\"]','[\"Hybrid\"]',2500.00,5000.00,'USD','[\"Bachelor’s or Master’s degree in Computer Science, Artificial Intelligence, Data Science, or a related field\", \"Strong knowledge of machine learning algorithms and deep learning concepts\", \"Proficiency in Python programming\", \"Experience with machine learning libraries such as TensorFlow, PyTorch, or Scikit-learn\", \"Knowledge of natural language processing or computer vision techniques\", \"Experience working with large datasets and data preprocessing\", \"Understanding of REST APIs and integrating AI models into applications\", \"Familiarity with databases such as MySQL, PostgreSQL, or NoSQL systems\", \"Experience with cloud platforms such as AWS, Google Cloud, or Azure is a plus\", \"Strong analytical and problem-solving skills\", \"Ability to work collaboratively in a cross-functional team environment\"]','[\"Design and develop machine learning models and AI solutions\", \"Train, evaluate, and optimize machine learning models\", \"Process and analyze large datasets to extract useful insights\", \"Integrate AI models into production systems and APIs\", \"Collaborate with software engineers and data scientists\", \"Monitor model performance and improve accuracy over time\", \"Stay updated with the latest AI and machine learning research\", \"Document technical designs and implementation details\"]','[\"Competitive salary package\", \"Health insurance\", \"Remote work flexibility\", \"Professional training and certifications\", \"Paid annual leave\", \"Opportunities to work on cutting-edge AI technologies\"]',1,'2026-03-11 10:15:40.000000','2026-03-15 23:59:59.000000',NULL,1,'2026-03-11 10:15:40.000000','2026-03-11 10:15:40.000000',NULL,'[\"Online application submission\", \"AI/ML technical assessment test\", \"Technical interview with AI team\", \"Final HR interview\"]',3,20,15),
('060c1003-070c-4c0f-b5fe-d31a02c8ece4','new','new','new','new','[\"Part-time\"]','[]',106000.00,147000.00,'USD','[\"new\"]','[]','[]',0,'2026-03-06 17:36:17.643292','2026-03-02 00:00:00.000000',NULL,1,'2026-03-06 17:36:17.643304','2026-03-07 20:57:14.760615',NULL,'[]',3,100,60),
('b7c4852f-81c3-42db-aac1-d325ce7dd0f1','Cloud Engineer','SkyHigh Technologies','Islamabad, Pakistan','SkyHigh Technologies is hiring a Cloud Engineer to design, implement, and manage cloud infrastructure on AWS and Azure. You will work closely with DevOps and backend teams to ensure secure, scalable, and highly available systems.','[\"Full-time\"]','[\"Hybrid\"]',200000.00,350000.00,'PKR','[\"BS/MS in Computer Science, IT, or related field\", \"2+ years experience in cloud engineering\", \"Hands-on experience with AWS, Azure, or GCP\", \"Familiarity with IaC tools (Terraform, CloudFormation)\", \"Understanding of CI/CD pipelines and automation\", \"Proficiency in Python, Bash, or similar scripting language\", \"Strong analytical and problem-solving skills\"]','[\"Design and manage cloud infrastructure\", \"Implement automation and deployment pipelines\", \"Monitor and troubleshoot cloud services\", \"Collaborate with engineering and DevOps teams\", \"Document cloud architecture and best practices\"]','[\"Health and dental insurance\", \"Flexible hybrid work environment\", \"Learning and certification support\", \"Annual performance bonuses\"]',1,'2026-03-10 19:56:41.809778',NULL,NULL,1,'2026-03-10 19:56:41.810821','2026-03-10 19:56:41.811160','057b20d4-c94b-45a5-b41f-fe4717aedfa4','[\"Resume Review\", \"Technical Assessment: Cloud architecture challenge\", \"Technical Interview: 45-60 minutes\", \"Culture and Team Interview\", \"Offer communicated within 5 business days\"]',3,100,60),
('7b1cfeb3-1d06-11f1-8f26-d8252e77cc9b','Software Engineer','TechNova Solutions','Lahore, Pakistan','TechNova Solutions is seeking a talented and motivated Software Engineer to join our growing engineering team. The successful candidate will be responsible for designing, developing, testing, and maintaining scalable web applications and backend systems.\n\nThe role requires strong analytical thinking and problem-solving skills, along with the ability to work in a collaborative development environment. The candidate will work closely with product managers, designers, and other developers to deliver high-quality software solutions that address real-world business challenges.\n\nKey responsibilities include developing RESTful APIs, integrating databases, implementing efficient backend logic, and optimizing application performance. The engineer will also participate in code reviews, debugging, testing, and improving software quality.\n\nThis position provides an excellent opportunity to work with modern technologies, contribute to impactful software products, and grow professionally in a dynamic and innovative technology environment.','[\"Full-time\"]','[\"Hybrid\"]',1500.00,3000.00,'USD','[\"Bachelor’s degree in Computer Science, Software Engineering, or a related technical field\", \"Strong understanding of programming fundamentals including data structures and algorithms\", \"Experience with programming languages such as Python, Java, or JavaScript\", \"Hands-on experience with web frameworks such as Django, Flask, Node.js, or Spring Boot\", \"Experience designing and implementing RESTful APIs\", \"Familiarity with relational databases such as MySQL or PostgreSQL\", \"Experience using Git and version control systems\", \"Understanding of software development lifecycle and agile development methodologies\", \"Knowledge of debugging, testing, and performance optimization techniques\", \"Basic knowledge of cloud platforms such as AWS, Azure, or Google Cloud is considered a plus\", \"Strong problem-solving and analytical thinking abilities\", \"Good communication skills and ability to work effectively within a development team\"]','[\"Design and develop scalable backend services and web applications\", \"Write clean, maintainable, and efficient code following best practices\", \"Develop and maintain RESTful APIs for frontend and third-party integrations\", \"Collaborate with cross-functional teams including designers and product managers\", \"Debug, troubleshoot, and resolve software issues\", \"Optimize application performance and scalability\", \"Participate in code reviews and technical discussions\", \"Contribute to improving development processes and system architecture\"]','[\"Competitive salary package\", \"Health insurance coverage\", \"Flexible working hours\", \"Hybrid work opportunities\", \"Paid annual and sick leave\", \"Professional development and training programs\"]',1,'2026-03-11 09:55:10.000000','2026-03-15 23:59:59.000000',NULL,1,'2026-03-11 09:55:10.000000','2026-03-11 09:55:10.000000',NULL,'[\"Online application submission\", \"Online technical assessment test\", \"Technical interview with engineering team\", \"Final HR interview\"]',3,20,15),
('c49770fd-7513-4d80-99cf-dfccf0a7bb12','Software Engineer','TechNova Solutions','Lahore, Pakistan','TechNova Solutions is seeking a talented and motivated Software Engineer to join our growing engineering team. The successful candidate will be responsible for designing, developing, testing, and maintaining scalable web applications and backend systems.\n\nThe role requires strong analytical thinking and problem-solving skills, along with the ability to work in a collaborative development environment. The candidate will work closely with product managers, designers, and other developers to deliver high-quality software solutions that address real-world business challenges.\n\nKey responsibilities include developing RESTful APIs, integrating databases, implementing efficient backend logic, and optimizing application performance. The engineer will also participate in code reviews, debugging, testing, and improving software quality.\n\nThis position provides an excellent opportunity to work with modern technologies, contribute to impactful software products, and grow professionally in a dynamic and innovative technology environment.','[\"Full-time\"]','[\"Hybrid\"]',1500.00,3000.00,'USD','[\"Bachelor\\u2019s degree in Computer Science, Software Engineering, or a related technical field\", \"Strong understanding of programming fundamentals including data structures and algorithms\", \"Experience with programming languages such as Python, Java, or JavaScript\", \"Hands-on experience with web frameworks such as Django, Flask, Node.js, or Spring Boot\", \"Experience designing and implementing RESTful APIs\", \"Familiarity with relational databases such as MySQL or PostgreSQL\", \"Experience using Git and version control systems\", \"Understanding of software development lifecycle and agile development methodologies\", \"Knowledge of debugging, testing, and performance optimization techniques\", \"Basic knowledge of cloud platforms such as AWS, Azure, or Google Cloud is considered a plus\", \"Strong problem-solving and analytical thinking abilities\", \"Good communication skills and ability to work effectively within a development team\"]','[\"Design and develop scalable backend services and web applications\", \"Write clean, maintainable, and efficient code following best practices\", \"Develop and maintain RESTful APIs for frontend and third-party integrations\", \"Collaborate with cross-functional teams including designers and product managers\", \"Debug, troubleshoot, and resolve software issues\", \"Optimize application performance and scalability\", \"Participate in code reviews and technical discussions\", \"Contribute to improving development processes and system architecture\"]','[\"Competitive salary package\", \"Health insurance coverage\", \"Flexible working hours\", \"Hybrid work opportunities\", \"Paid annual and sick leave\", \"Professional development and training programs\"]',1,'2026-03-11 04:52:40.114389','2026-03-15 23:59:59.000000',NULL,1,'2026-03-11 04:52:40.114704','2026-03-11 04:52:40.120399',NULL,'[\"Online application submission\", \"Online technical assessment test\", \"Technical interview with engineering team\", \"Final HR interview\"]',3,20,15),
('28740540-dcbe-4791-bfc0-e4d79728b749','Front-end developer and React Expert','Front-end team','Lahore','we need a front-end developer','[\"Full-time\"]','[]',118000.00,168000.00,'USD','[\"2 years of experience in React\", \"Html\", \"CSS\", \"JavaScript\"]','[]','[]',0,'2026-03-07 14:24:02.208113','2026-03-05 00:00:00.000000',NULL,1,'2026-03-07 14:24:02.208145','2026-03-07 20:57:14.759034',NULL,'[]',4,50,60),
('73edea20-2f48-420c-a507-f81f7340b54d','Machine Learning Engineer','DataSolve Analytics','Lahore, Pakistan','DataSolve Analytics is looking for a Machine Learning Engineer to develop models for predictive analytics and AI-driven applications. The candidate will work with data scientists, backend engineers, and product teams to build scalable ML pipelines and integrate AI solutions into production systems.','[\"Full-time\"]','[\"Onsite\"]',220000.00,400000.00,'PKR','[\"BS/MS in Computer Science, AI, or related field\", \"2+ years experience in machine learning development\", \"Proficiency in Python and ML libraries (scikit-learn, TensorFlow, PyTorch)\", \"Experience with data preprocessing and feature engineering\", \"Knowledge of SQL and NoSQL databases\", \"Understanding of model deployment and REST API integration\", \"Strong analytical and problem-solving skills\"]','[\"Design and implement machine learning models\", \"Collaborate with data engineers to build pipelines\", \"Deploy and monitor models in production\", \"Write clean, efficient, and tested code\", \"Participate in code reviews and knowledge sharing sessions\"]','[\"Health and wellness coverage\", \"Annual bonuses and incentives\", \"Professional development and certifications\", \"Collaborative and innovative culture\"]',0,'2026-03-10 19:56:41.803666',NULL,NULL,1,'2026-03-10 19:56:41.804875','2026-03-10 19:56:41.805179','b9bf3ae5-961c-45bf-8ccd-690ec1d1cfee','[\"Resume Screening\", \"Technical Assessment: ML coding challenge\", \"Technical Interview: 60 minutes\", \"Team Discussion and Culture Fit Interview\", \"Offer communicated within 5 business days\"]',5,100,90);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` uuid NOT NULL,
  `notes` longtext DEFAULT NULL,
  `saved_at` datetime(6) NOT NULL,
  `job_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_jobs_user_id_job_id_9a24e82e_uniq` (`user_id`,`job_id`),
  KEY `saved_jobs_job_id_90bf0c07_fk_jobs_id` (`job_id`),
  CONSTRAINT `saved_jobs_job_id_90bf0c07_fk_jobs_id` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `saved_jobs_user_id_697a9948_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_certificates`
--

DROP TABLE IF EXISTS `user_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_certificates` (
  `id` uuid NOT NULL,
  `name` varchar(255) NOT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  `year` varchar(50) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_certificates_user_id_72ea8171_fk_users_id` (`user_id`),
  CONSTRAINT `user_certificates_user_id_72ea8171_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_certificates`
--

LOCK TABLES `user_certificates` WRITE;
/*!40000 ALTER TABLE `user_certificates` DISABLE KEYS */;
INSERT INTO `user_certificates` VALUES
('8aac8fb1-4e07-4eff-8a05-19266a7a3c78','Create Charts and Dashboard using Google','','',NULL,'2026-03-11 01:33:18.651814','2026-03-11 01:33:18.651880','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('06535cb0-569e-400f-bafd-324d041001a4','Critical Thinking & Problem-Solving','','',NULL,'2026-03-11 01:33:18.650819','2026-03-11 01:33:18.650924','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('f5be1112-be2e-4337-bd77-4a6c1f0713e1','Google AI Essentials','Coursera','2024',NULL,'2026-03-11 01:33:18.654580','2026-03-11 01:33:18.654695','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('10a01a71-bbb4-4eb0-9744-4d75994e457a','University Team Collaboration & Leadership','','',NULL,'2026-03-11 01:33:18.656854','2026-03-11 01:33:18.656914','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('d8eefbb4-229c-4387-a4b2-58eee7d604f6','Interpersonal Skills','','',NULL,'2026-03-11 01:33:18.653973','2026-03-11 01:33:18.654038','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('065d5cfc-4e58-4481-8fe5-6ca62997e0bc','Effective Communication &','','',NULL,'2026-03-11 01:33:18.652408','2026-03-11 01:33:18.652486','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('ff69baae-c786-4ec6-8b24-86bfe2b48ea1','Proactive & Self-Motivated','','',NULL,'2026-03-11 01:33:18.655539','2026-03-11 01:33:18.655606','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('0dd7de56-a393-4637-a0e6-a00b1c9e282f','Google Data Analyst Course ()','National Strong Organizational Skills','2025',NULL,'2026-03-11 01:33:18.656212','2026-03-11 01:33:18.656272','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('07b85ca4-cfc5-40e0-b5cd-a88682d1b0d2','Supervised Machine Learning','Stanford, Online','Nov 17, 2025',NULL,'2026-04-23 14:55:19.879355','2026-04-23 14:55:19.879444','8ab28678-2048-4951-b497-320777e9f0b6'),
('a707697a-e4da-4575-8cbc-af4df2ea099d','Advanced Learning Algorithms','Stanford, Online','Dec 15, 2025',NULL,'2026-04-23 14:55:19.878365','2026-04-23 14:55:19.878511','8ab28678-2048-4951-b497-320777e9f0b6'),
('9b627f77-de8c-46e7-b353-df0edd3440f5','Sheets','Coursera','2022',NULL,'2026-03-11 01:33:18.653390','2026-03-11 01:33:18.653457','4c28b6fd-3e0e-4efa-a743-53c5facd168e');
/*!40000 ALTER TABLE `user_certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_projects`
--

DROP TABLE IF EXISTS `user_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_projects` (
  `id` uuid NOT NULL,
  `title` varchar(255) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_projects_user_id_d1648011_fk_users_id` (`user_id`),
  CONSTRAINT `user_projects_user_id_d1648011_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_projects`
--

LOCK TABLES `user_projects` WRITE;
/*!40000 ALTER TABLE `user_projects` DISABLE KEYS */;
INSERT INTO `user_projects` VALUES
('10d47c26-22f6-4ac0-a280-0e80f69ab2f8','and announcements, and Flex for checking attendance and marks.','','Feb. 2025 – Present','Provided students with the ability to view timetable, attendance, access learning resources, and manage tasks. Enabled teachers to mark attendance, assign grades, upload learning resources, and view their timetable. Designed the frontend using HTML and CSS, with JavaScript for event handling. Used Python (Django) for backend development, SQLite for database management, and BeautifulSoup to scrape teacher data from the university website. ClickNBuild is a startup web application designed to connect clients looking to renovate or build houses, apartments, etc., with builders who can bid on their projects. Collaborating with two teammates to develop the app, using HTML, CSS, and JavaScript for the frontend, Python (Flask) for the backend, and MySQL for database management. Developed and hosted an initial prototype version accessible at https://dilawar123.pythonanywhere.com/ Currently in development with ongoing work to fully implement all features.',NULL,'2026-03-07 21:16:32.522762','2026-03-07 21:16:32.522940','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('af4e327d-0afe-4672-90c1-2fe003884ca3','Database Management System (Current Semester Project)','','','Developing a database system to efficiently manage structured data. Implementing SQL-based queries and relational database techniques.',NULL,'2026-03-11 01:33:18.660294','2026-03-11 01:33:18.660374','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('6dca8d47-4a4b-42f0-bb2a-3cf5cf03ede6','Price Prediction System (Completed)','','','Developed a machine learning model to predict property prices using data fetched from',NULL,'2026-03-11 01:33:18.658482','2026-03-11 01:33:18.658548','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('2d8114b5-3ac8-44df-8e8c-557e18605d9d','Zameen.com.','','','Applied data preprocessing, feature engineering, and predictive modeling techniques in Python.',NULL,'2026-03-11 01:33:18.659578','2026-03-11 01:33:18.659725','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('af44f60e-d2f1-4127-9afa-56b96d7287c1','Zehni Sehat','Nusys Lab','July 2025 - Sept. 2025','• Developed a full-stack mental health platform connecting patients with healthcare professionals.\n• Implemented doctor directory, appointment booking system, and patient dashboards.\n• Built self-assessment modules allowing users to evaluate and track mental health progress.\n• Implemented JWT-based authentication with separate roles for patients, doctors, and administrators.\n• Integrated Stripe payment processing and secure file uploads for medical reports.\n• Developed under the supervision of faculty from McLean Hospital (Belmont, MA) and Harvard Medical School\n(Boston, MA).',NULL,'2026-04-23 14:55:19.881294','2026-04-23 14:55:19.881379','8ab28678-2048-4951-b497-320777e9f0b6'),
('79ec9053-9831-4c0e-992f-5cb1b366d014','ClickNBuild','FAST NUCES','','• ClickNBuild is a startup web application designed to connect clients looking to renovate or build houses,\napartments, etc., with builders who can bid on their projects.\n• Collaborating with two teammates to develop the app, using HTML, CSS, and JavaScript for the frontend, Python\n(Flask) for the backend, and MySQL for database management.\n• Developed and hosted an initial prototype version accessible at https://dilawar123.pythonanywhere.com/\n• Currently in development with ongoing work to fully implement all features.',NULL,'2026-03-11 01:31:03.454288','2026-03-11 01:31:03.455803','79e724c2-e159-484b-8869-7a3f09796d66'),
('6bb43966-c633-4f03-9f43-8d1f3882a08a','and announcements, and Flex for checking attendance and marks.','','Feb. 2025 – Present','Provided students with the ability to view timetable, attendance, access learning resources, and manage tasks. Enabled teachers to mark attendance, assign grades, upload learning resources, and view their timetable. Designed the frontend using HTML and CSS, with JavaScript for event handling. Used Python (Django) for backend development, SQLite for database management, and BeautifulSoup to scrape teacher data from the university website. ClickNBuild is a startup web application designed to connect clients looking to renovate or build houses, apartments, etc., with builders who can bid on their projects. Collaborating with two teammates to develop the app, using HTML, CSS, and JavaScript for the frontend, Python (Flask) for the backend, and MySQL for database management. Developed and hosted an initial prototype version accessible at https://dilawar123.pythonanywhere.com/ Currently in development with ongoing work to fully implement all features.',NULL,'2026-03-10 20:43:44.692390','2026-03-10 20:43:44.692493','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('9a2287a5-dc21-49b1-8d60-aaaafb962b11','National University of Computer and Emerging Sciences (NUCES)','','Sep 2023 - Dec 2023','Developed a system to manage bank accounts, transactions, and customer information using Object-Oriented Programming (OOP) in C++. Implemented data structures to enhance system efficiency and performance.',NULL,'2026-03-11 01:33:18.657906','2026-03-11 01:33:18.657980','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('18e745cc-f01a-4072-b244-b1a5e216a5ae','Flexi','FAST NUCES','Feb. 2025 ','Provided students with the ability to view timetable, attendance, access learning resources, and manage tasks. Enabled teachers to mark attendance, assign grades, upload learning resources, and view their timetable. Designed the frontend using HTML and CSS, with JavaScript for event handling. Used Python (Django) for backend development, SQLite for database management, and BeautifulSoup to scrape teacher data from the university website. ClickNBuild is a startup web application designed to connect clients looking to renovate or build houses, apartments, etc., with builders who can bid on their projects. Collaborating with two teammates to develop the app, using HTML, CSS, and JavaScript for the frontend, Python (Flask) for the backend, and MySQL for database management. Developed and hosted an initial prototype version accessible at https://dilawar123.pythonanywhere.com/ Currently in development with ongoing work to fully implement all features.',NULL,'2026-03-11 01:31:03.447918','2026-03-11 01:31:03.449021','79e724c2-e159-484b-8869-7a3f09796d66'),
('ddfec9ac-5c84-455f-a7c3-b2e009c4e766','Dual Brain Psychology Wellness Bot','Nusys Lab','July 2025 - Sept. 2025','• Developed a mobile-based AI wellness chatbot application using Flutter designed to guide users through structured\nemotional wellness interactions.\n• Built the system based on the therapeutic framework described in the book by Dr. Fredric Schiffer, enabling the\nchatbot to simulate structured emotional guidance normally provided by a therapist.\n• Implemented Retrieval-Augmented Generation (RAG) with LangChain and Python to generate conversational\nresponses based on the principles of Dual-Brain Psychology.\n• Designed an interactive avatar-based chatbot interface with conversational animations.\n• Integrated face tracking APIs to capture visual cues that help guide conversational flow and emotional state\ntransitions.\n• Developed under the supervision of faculty from McLean Hospital (Belmont, MA) and Harvard Medical School\n(Boston, MA).',NULL,'2026-04-23 14:55:19.881949','2026-04-23 14:55:19.882028','8ab28678-2048-4951-b497-320777e9f0b6'),
('5f4f7c03-8356-41f0-bd4f-bb18fa9ba1ce','SAGE ','FAST NUCES','Sept.2025 - Mar. 2026','• Developed an AI-powered system to automate the faculty hiring process at Universities and Industries.\n• Implemented CV parsing to extract candidate skills, education, and experience from uploaded resumes.\n• Designed a matching algorithm to recommend candidates based on job requirements and qualifications.\n• Built an automated test generation system using Retrieval Augmented Generation (RAG) from a question bank.\n• Developed an AI interview bot to evaluate candidate confidence, personality, and communication skills.\n• Implemented a candidate–job matching system using the Gale–Shapley Stable Matching Algorithm to ensure\noptimal pairing between employer requirements and candidate preferences.',NULL,'2026-04-23 14:55:19.880545','2026-04-23 14:55:19.880665','8ab28678-2048-4951-b497-320777e9f0b6'),
('cd1798d8-d335-4e1b-af23-dc8cd49f00d8','ClickNBuild','FAST NUCES','Jan. 2025 - Mar. 2025','• ClickNBuild is a startup web application designed to connect clients looking to renovate or build houses with\nbuilders who can bid on their projects.\n• Developed the app using HTML, CSS, and JavaScript for the frontend and Flask with MySQL for backend services,\nand implemented Stripe for payments.',NULL,'2026-04-23 14:55:19.882889','2026-04-23 14:55:19.882983','8ab28678-2048-4951-b497-320777e9f0b6');
/*!40000 ALTER TABLE `user_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_research`
--

DROP TABLE IF EXISTS `user_research`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_research` (
  `id` uuid NOT NULL,
  `title` varchar(255) NOT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `period` varchar(100) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_research_user_id_cc3f0113_fk_users_id` (`user_id`),
  CONSTRAINT `user_research_user_id_cc3f0113_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_research`
--

LOCK TABLES `user_research` WRITE;
/*!40000 ALTER TABLE `user_research` DISABLE KEYS */;
INSERT INTO `user_research` VALUES
('f8a2a6eb-a644-47d4-a54a-a1fa9d270d2b','DBP Chatbot','FAST NUCES','June 2025 - July 2026','A chatbot focused on Dual brain phsycology.','2026-03-10 20:20:31.050216','2026-03-10 20:20:31.050314','79e724c2-e159-484b-8869-7a3f09796d66');
/*!40000 ALTER TABLE `user_research` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_skills` (
  `id` uuid NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `skill_type` varchar(20) NOT NULL,
  `proficiency_level` varchar(20) DEFAULT NULL,
  `years_of_experience` decimal(3,1) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_skills_user_id_skill_name_skill_type_2bda69a6_uniq` (`user_id`,`skill_name`,`skill_type`),
  CONSTRAINT `user_skills_user_id_8140060b_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_skills`
--

LOCK TABLES `user_skills` WRITE;
/*!40000 ALTER TABLE `user_skills` DISABLE KEYS */;
INSERT INTO `user_skills` VALUES
('6867351d-aabb-4da3-a75a-077632c088ff','html','tool','intermediate',NULL,'2026-03-07 21:16:32.503607','2026-03-07 21:16:32.503769','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('a865b6bb-fdc1-4164-b925-0b35bc66eb60','javascript','language','intermediate',NULL,'2026-04-23 14:55:19.865321','2026-04-23 14:55:19.865398','8ab28678-2048-4951-b497-320777e9f0b6'),
('98f19bf7-e398-4601-b7b1-0b4d7e6a7ca1','git','tool','intermediate',NULL,'2026-03-07 21:16:32.511841','2026-03-07 21:16:32.511962','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('584798f0-a53b-4bf7-bc45-0cb834f62f55','javascript','language','intermediate',NULL,'2026-03-11 01:31:03.360880','2026-03-11 01:31:03.362043','79e724c2-e159-484b-8869-7a3f09796d66'),
('89c7bc8c-a6d4-4121-83c9-152ba3c47232','python','language','intermediate',NULL,'2026-03-07 21:16:32.499789','2026-03-07 21:16:32.500053','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('d84e045e-310d-4c9f-a760-1694e42769fe','react','framework','intermediate',NULL,'2026-04-23 14:55:19.865884','2026-04-23 14:55:19.865959','8ab28678-2048-4951-b497-320777e9f0b6'),
('dd1989ef-803f-43fd-83fb-16a0d933ec42','css','tool','intermediate',NULL,'2026-03-10 20:43:44.679375','2026-03-10 20:43:44.679434','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('72a17578-418f-463b-9823-1ed824f88976','mysql','tool','intermediate',NULL,'2026-03-07 21:16:32.508705','2026-03-07 21:16:32.508871','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('c04f6ee5-f3f9-4270-9d0c-2363055405cd','php','tool','intermediate',NULL,'2026-03-07 21:16:32.507863','2026-03-07 21:16:32.508021','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('d1a7191e-93a6-438a-831d-28282aeec7e8','spring','framework','intermediate',NULL,'2026-03-10 20:43:44.678318','2026-03-10 20:43:44.678381','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('b8c0b352-a712-4ee2-848c-2a2b64e70efe','html','tool','intermediate',NULL,'2026-03-10 20:43:44.678848','2026-03-10 20:43:44.678911','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('7bb5e23b-e5e7-4e59-992a-2a717151b319','php','tool','intermediate',NULL,'2026-03-10 20:43:44.681978','2026-03-10 20:43:44.682046','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('3cd610d9-c555-4b83-b960-2b358068a32a','growth','tool','intermediate',NULL,'2026-03-11 01:33:18.640863','2026-03-11 01:33:18.641275','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('2e873daa-2d8d-4fe0-812e-2e96f47c6ce1','sql','tool','intermediate',NULL,'2026-04-23 14:55:19.863372','2026-04-23 14:55:19.863476','8ab28678-2048-4951-b497-320777e9f0b6'),
('e1350bcc-3f32-4d9d-9d04-318a0302eadf','git','tool','intermediate',NULL,'2026-03-11 01:31:03.388838','2026-03-11 01:31:03.390184','79e724c2-e159-484b-8869-7a3f09796d66'),
('b839c9ec-bfd8-46ba-a48d-34dfe42d54d2','django','framework','intermediate',NULL,'2026-04-23 14:55:19.869991','2026-04-23 14:55:19.870089','8ab28678-2048-4951-b497-320777e9f0b6'),
('bcb22528-e844-48f4-b3ef-395452c52d81','git','tool','intermediate',NULL,'2026-04-23 14:55:19.868613','2026-04-23 14:55:19.868697','8ab28678-2048-4951-b497-320777e9f0b6'),
('b5c1407e-85b0-4d80-b5b0-3f78e6271a55','sql','tool','intermediate',NULL,'2026-03-11 01:33:18.643599','2026-03-11 01:33:18.643668','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('e00a94ac-6e94-430f-8a71-469c0bea53d6','django','framework','intermediate',NULL,'2026-03-07 21:16:32.507154','2026-03-07 21:16:32.507284','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('8fcef511-f7b3-446d-a758-4910d6f1af6d','communication','tool','intermediate',NULL,'2026-03-11 01:33:18.644753','2026-03-11 01:33:18.644835','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('2505e404-bcb2-4a35-8d52-4c4a744d5198','java','language','intermediate',NULL,'2026-03-07 21:16:32.510363','2026-03-07 21:16:32.510482','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('dc01c2d6-b8ed-497a-ac0a-4d40bda22b0c','process improvement','tool','intermediate',NULL,'2026-03-11 01:33:18.648359','2026-03-11 01:33:18.648424','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('05c7359b-7cea-4ca9-ba48-559b881ffacb','javascript','language','intermediate',NULL,'2026-03-07 21:16:32.505969','2026-03-07 21:16:32.506158','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('063a1df8-b63a-4a94-849b-5e8cfe94e8ea','Rust','tool','intermediate',NULL,'2026-04-23 14:55:19.871896','2026-04-23 14:55:19.871970','8ab28678-2048-4951-b497-320777e9f0b6'),
('32398f6c-d904-402d-a365-61fe248e154c','pandas','tool','intermediate',NULL,'2026-03-11 01:33:18.646471','2026-03-11 01:33:18.646534','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('9a58787a-9650-4a9e-b8df-64175ec44842','mysql','tool','intermediate',NULL,'2026-03-10 20:43:44.682599','2026-03-10 20:43:44.682704','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('e1305afe-5ec2-4239-82b5-65ac5be2e763','flask','framework','intermediate',NULL,'2026-03-10 20:43:44.683215','2026-03-10 20:43:44.683277','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('33431b11-c0b2-481a-8491-667387e550b6','html','tool','intermediate',NULL,'2026-04-23 14:55:19.864061','2026-04-23 14:55:19.864148','8ab28678-2048-4951-b497-320777e9f0b6'),
('17cef257-c56e-4a4f-a2a4-6dbd82a65c94','deep learning','tool','intermediate',NULL,'2026-04-23 14:55:19.871288','2026-04-23 14:55:19.871362','8ab28678-2048-4951-b497-320777e9f0b6'),
('af7c92e6-cfc3-4ec5-a5c6-73f57618b1cc','leadership','tool','intermediate',NULL,'2026-03-11 01:33:18.645888','2026-03-11 01:33:18.645955','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('bab66bb7-5d5b-482a-8856-77e59bf30a3b','spring','framework','intermediate',NULL,'2026-03-07 21:16:32.502526','2026-03-07 21:16:32.502693','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('dd105866-05d5-443e-8e16-84b6df1837cd','numpy','tool','intermediate',NULL,'2026-03-11 01:33:18.647069','2026-03-11 01:33:18.647169','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('7229866f-1e1f-4c1a-9437-8b08c6ecd0d4','django','framework','intermediate',NULL,'2026-03-10 20:43:44.681383','2026-03-10 20:43:44.681462','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('4d442645-9852-4432-bef4-8cca39b2b0d0','data analysis','tool','intermediate',NULL,'2026-03-11 01:33:18.627996','2026-03-11 01:33:18.628172','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('cffea253-9902-4495-a9e8-8dff72d0e9fb','python','language','intermediate',NULL,'2026-03-10 20:43:44.676531','2026-03-10 20:43:44.677187','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('218e7ddd-6c72-4c55-879b-8f99c4dda2c8','css','tool','intermediate',NULL,'2026-04-23 14:55:19.864703','2026-04-23 14:55:19.864784','8ab28678-2048-4951-b497-320777e9f0b6'),
('78c1c9a5-144d-48d3-a07b-9071cc83cb7b','git','tool','intermediate',NULL,'2026-03-10 20:43:44.684957','2026-03-10 20:43:44.685017','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('cc7f0126-59a5-4d56-8dad-96a3db015a0d','mysql','tool','intermediate',NULL,'2026-03-11 01:31:03.376778','2026-03-11 01:31:03.378028','79e724c2-e159-484b-8869-7a3f09796d66'),
('34b4674d-477f-4edd-9f97-9af206afb5f7','php','tool','intermediate',NULL,'2026-03-11 01:31:03.371107','2026-03-11 01:31:03.372424','79e724c2-e159-484b-8869-7a3f09796d66'),
('7bc00980-2248-472a-b4fb-9b0cdf1bf2a4','php','tool','intermediate',NULL,'2026-04-23 14:55:19.867099','2026-04-23 14:55:19.867180','8ab28678-2048-4951-b497-320777e9f0b6'),
('c4803ddd-979e-4514-bb50-a99ad25e19cc','sql','tool','intermediate',NULL,'2026-03-10 20:43:44.684215','2026-03-10 20:43:44.684272','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('a3478fa8-0d9e-43a1-a616-aa00cfab9210','machine learning','tool','intermediate',NULL,'2026-03-11 01:33:18.642402','2026-03-11 01:33:18.642497','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('93ff7901-7f74-425e-a41d-aec6e9e434f2','css','tool','intermediate',NULL,'2026-03-07 21:16:32.505133','2026-03-07 21:16:32.505283','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('90f109f3-e3ab-4fbd-90b1-af588d42487d','spring','framework','intermediate',NULL,'2026-03-11 01:31:03.341026','2026-03-11 01:31:03.341139','79e724c2-e159-484b-8869-7a3f09796d66'),
('cfd40dee-4132-4e9a-945e-b008c45ae132','logistics','tool','intermediate',NULL,'2026-03-10 20:43:44.677738','2026-03-10 20:43:44.677808','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('0fce0baa-0651-47f1-ac62-b06e0e9df41e','python','language','intermediate',NULL,'2026-04-23 14:55:19.861165','2026-04-23 14:55:19.861345','8ab28678-2048-4951-b497-320777e9f0b6'),
('4f02ef75-1e50-45b4-965e-b74ddceb43ee','css','tool','intermediate',NULL,'2026-03-11 01:31:03.358172','2026-03-11 01:31:03.358385','79e724c2-e159-484b-8869-7a3f09796d66'),
('e143c736-f3f2-436b-a45b-bf525d53f1ab','javascript','language','intermediate',NULL,'2026-03-10 20:43:44.680152','2026-03-10 20:43:44.680215','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('7275035d-d951-4629-b519-ca3dbd99405a','machine learning','tool','intermediate',NULL,'2026-04-23 14:55:19.870671','2026-04-23 14:55:19.870749','8ab28678-2048-4951-b497-320777e9f0b6'),
('8ec68783-3658-4aee-a806-cb1828376345','logistics','tool','intermediate',NULL,'2026-03-07 21:16:32.501263','2026-03-07 21:16:32.501479','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('28581b67-6596-46c9-97dc-cf794c3c57df','oracle','tool','intermediate',NULL,'2026-03-11 01:33:18.647770','2026-03-11 01:33:18.647891','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('e4698364-cceb-401a-8848-cfe68f5485c1','java','language','intermediate',NULL,'2026-04-23 14:55:19.862419','2026-04-23 14:55:19.862563','8ab28678-2048-4951-b497-320777e9f0b6'),
('bdd851df-adb1-4efb-9500-d4ef3ba7b611','sql','tool','intermediate',NULL,'2026-03-11 01:31:03.382976','2026-03-11 01:31:03.384255','79e724c2-e159-484b-8869-7a3f09796d66'),
('d00bc7fa-ea0c-43ab-93f2-db8b2a732471','flask','framework','intermediate',NULL,'2026-03-11 01:31:03.380513','2026-03-11 01:31:03.380723','79e724c2-e159-484b-8869-7a3f09796d66'),
('150fba22-7065-4278-b359-e4238ded175c','html','tool','intermediate',NULL,'2026-03-11 01:31:03.356802','2026-03-11 01:31:03.357051','79e724c2-e159-484b-8869-7a3f09796d66'),
('08e84c94-0b55-4cc8-897f-e777e31b6333','sql','tool','intermediate',NULL,'2026-03-07 21:16:32.511091','2026-03-07 21:16:32.511210','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('4eeaab60-2344-4478-b6a5-ecf810bae9e3','flask','framework','intermediate',NULL,'2026-04-23 14:55:19.869298','2026-04-23 14:55:19.869419','8ab28678-2048-4951-b497-320777e9f0b6'),
('e19871a4-6570-4572-a8ff-f07212de9d73','logistics','tool','intermediate',NULL,'2026-03-11 01:31:03.340300','2026-03-11 01:31:03.340413','79e724c2-e159-484b-8869-7a3f09796d66'),
('f7b3d9da-866a-4aff-92c3-f0ae80a51829','flask','framework','intermediate',NULL,'2026-03-07 21:16:32.509570','2026-03-07 21:16:32.509699','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('a59f2359-af86-45da-b9b0-f7be7a2c9b93','python','language','intermediate',NULL,'2026-03-11 01:33:18.643022','2026-03-11 01:33:18.643090','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('a8611cd7-0e56-427d-912f-f817d4d06046','python','language','intermediate',NULL,'2026-03-11 01:31:03.339338','2026-03-11 01:31:03.339570','79e724c2-e159-484b-8869-7a3f09796d66'),
('0eae127d-f95c-4375-9da5-f9b992f862e8','java','language','intermediate',NULL,'2026-03-11 01:31:03.381496','2026-03-11 01:31:03.381668','79e724c2-e159-484b-8869-7a3f09796d66'),
('b9a4dcc6-ab79-4039-addd-fa27c0d6d28e','critical thinking','tool','intermediate',NULL,'2026-03-11 01:33:18.644156','2026-03-11 01:33:18.644224','4c28b6fd-3e0e-4efa-a743-53c5facd168e'),
('c956a057-beb2-4398-a18d-fc1fdfdd10d5','java','language','intermediate',NULL,'2026-03-10 20:43:44.683744','2026-03-10 20:43:44.683804','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('30800fe9-b4e2-4d8e-96f3-ff58bd9b61d2','django','framework','intermediate',NULL,'2026-03-11 01:31:03.366096','2026-03-11 01:31:03.367346','79e724c2-e159-484b-8869-7a3f09796d66');
/*!40000 ALTER TABLE `user_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` uuid NOT NULL,
  `email` varchar(254) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bio` longtext DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `street_address` varchar(255) DEFAULT NULL,
  `city_state` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_onboarded` tinyint(1) NOT NULL,
  `interview_recording_url` varchar(500) DEFAULT NULL,
  `resume_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('5c4b0700-0b56-415d-a86c-230195822294','test@example.com','Test','User',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-03-05 16:10:11.408370','2026-03-05 16:10:11.409417',NULL,0,NULL,NULL),
('8ab28678-2048-4951-b497-320777e9f0b6','dilawar123@gmail.com','Dilawar','Khan','345-5911326','Dilawar Khan\n0345-5911326 | dilawarkdk321@gmail.com | LinkedIn | Github',NULL,'pbkdf2_sha256$1000000$2FMD3qK8y0VKYLKND3FJZM$HSE9YP68tPEw4bp2FnzRjn/OryGTALzAjDHT0tun8DA=',NULL,'KP',NULL,'Pakistan','2026-04-23 14:43:47.108673','2026-04-23 14:55:19.883609','2026-04-23 14:43:57.866607',1,NULL,'http://localhost:8000/media/resumes/4e842ef8-d69b-4b5d-8861-e87d6ef3f7b4_Dilawar_Resume.pdf'),
('4c28b6fd-3e0e-4efa-a743-53c5facd168e','bilal@gmail.com','@BilalFarooq','bilalfarooq056','+923314970969','Bilal Farooq \n \n \n +923314970969 · bilalfarooq878675@gmail.com \n @BilalFarooq bilalfarooq056 \n Block 14, Gulistan-e-Johar, Karachi, Pakistan \n DEDICATED FAST-NUCES STUDENT WITH A PASSION FOR AI \n \n A dedicated Artificial Intelligence student at FAST-NUCES with a strong passion for AI, data analysis, and\n database management. I am eager to apply my',NULL,'pbkdf2_sha256$1200000$cwwDgiIvqd7jSE416NfM9I$9MijvJG6MFaoi3Q3DYvWY03rsIHHY9/GmIRVMC1fFlU=',NULL,'Karachi',NULL,'Pakistan','2026-03-11 01:32:21.541409','2026-03-11 01:33:18.660969','2026-03-11 01:32:37.580149',1,NULL,'http://localhost:8000/media/resumes/edd8d880-87a2-4711-b5ff-4263d728ff6e_Bilal_Farooq_Resume.pdf'),
('79e724c2-e159-484b-8869-7a3f09796d66','dilawarkdk321@gmail.com','Dilawar','Khan','345-5911326','Dilawar Khan \n0345-5911326 | dilawarkdk321@gmail.com | LinkedIn | Github',NULL,'pbkdf2_sha256$1200000$G9Q5O3K9btdL6VMI6phcxE$fccy7Ys1mu54bhJCXDCvdyHs+o5Hzb2qsxruDyMJBAc=',NULL,'KP',NULL,'Pakistan','2026-03-05 11:03:08.042833','2026-04-18 15:48:58.584974','2026-04-18 15:48:58.584680',1,NULL,'http://localhost:8000/media/resumes/feb0f0bb-e20d-490d-862e-f04c8a8db682_Dilawar_Resume.pdf'),
('6f3bb2c3-a91a-4e40-a7df-8915c0470642','abdullah@gmail.com','Abdullah','','034122222222',NULL,NULL,'pbkdf2_sha256$1200000$9H6oFiqY36OFNjYO6tKWch$CUMOopxIqs3Greacvc1wgoI+sr54gA/8k6gtraFq9A8=',NULL,NULL,NULL,NULL,'2026-03-10 16:51:42.315300','2026-03-10 16:54:05.251169','2026-03-10 16:52:21.036176',1,NULL,'http://localhost:8000/media/resumes/0f787d94-dd73-489d-9e75-2ec2a83b0820_Abdullah-Sofware-Engineer_(1).pdf'),
('48ece145-e5a5-46c9-9a90-fb62549b20c3','khan@gmail.com','Dilawar','Khan','345-5911326','Dilawar Khan\n0345-5911326 | dilawarkdk321@gmail.com | LinkedIn | Github',NULL,'pbkdf2_sha256$1200000$KlYJckgDAgTvRKioasEAoT$Xgvv0KUDJa+0X/eGFEk1so8KR+I0hDYJx7N7OBdWCjk=',NULL,'KP',NULL,NULL,'2026-03-05 11:04:50.551274','2026-04-22 15:57:05.866909','2026-04-22 15:57:05.863823',1,NULL,NULL),
('96a3a0e1-0cfa-45b2-964e-fc67474ba892','dilawar@gmail.com','Dilawar','Khan','345-5911326','Dilawar Khan \n 0345-5911326 | dilawarkdk321@gmail.com | LinkedIn | Github',NULL,'pbkdf2_sha256$1200000$R2Nf1cSfuclU0bv11HTdyf$vXxJGS/x4UxHbWt1u2usyTh2WkMxrbnS6MgjlukBvb8=',NULL,'KP',NULL,NULL,'2026-03-10 20:43:14.209894','2026-03-10 20:43:44.693301','2026-03-10 20:43:24.121085',1,NULL,'http://localhost:8000/media/resumes/b1c81f6f-7b47-4405-bd1f-2693925dccc9_Dilawar_Resume.pdf');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work_experience`
--

DROP TABLE IF EXISTS `work_experience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `work_experience` (
  `id` uuid NOT NULL,
  `job_title` varchar(200) NOT NULL,
  `company` varchar(200) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL,
  `description` longtext DEFAULT NULL,
  `responsibilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`responsibilities`)),
  `achievements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`achievements`)),
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` uuid NOT NULL,
  PRIMARY KEY (`id`),
  KEY `work_experience_user_id_45dabea3_fk_users_id` (`user_id`),
  CONSTRAINT `work_experience_user_id_45dabea3_fk_users_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work_experience`
--

LOCK TABLES `work_experience` WRITE;
/*!40000 ALTER TABLE `work_experience` DISABLE KEYS */;
INSERT INTO `work_experience` VALUES
('58316b1a-acbf-4540-96c6-0bb330f72532','Software Engineering Intern','NUSyS Research Lab, FAST-NUCES',NULL,'2026-04-23',NULL,0,'Period: July 2025 – Sept. 2025\n• Contributed to the development of software components for research-based technology projects at the NUSyS\nResearch Lab.\n• Worked on Dual-Brain Psychology, a research initiative exploring cerebral laterality and psychopathology-based\ntherapy.\n• Assisted in building features for Zehni Sehat, a mental health and wellbeing platform designed for Pakistan.\n• Collaborated in a research environment supervised by faculty connected with McLean Hospital and Harvard\nMedical School USA.','[]','[]','2026-04-23 14:55:19.876016','2026-04-23 14:55:19.876229','8ab28678-2048-4951-b497-320777e9f0b6'),
('2bd4af40-14f0-4d34-bf47-11386ce06324','T echnical Content W riter','Company',NULL,'2026-03-07',NULL,0,'Period: Sept. 2024 – Present\n','[]','[]','2026-03-07 21:16:32.516377','2026-03-07 21:16:32.516596','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('1dbd7fcf-42cc-4860-91a9-2653e8eed52e','Zindigi Prize Peshawar, KP','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-07',NULL,0,'Period: \nCo-led the outreach team for Zindigi Prize, a society aimed at helping startups pitch their ideas and get support. Organized information sessions, coordinated guest speakers, and managed event logistics to explain Zindigi Prize and encourage startups to participate. Collaborated with the team to plan outreach activities, handle communications, and ensure the smooth running of events.','[]','[]','2026-03-07 21:16:32.518883','2026-03-07 21:16:32.519058','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('af5f457d-f902-402b-9800-279a659cd6a9','Achievements','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-07',NULL,0,'Period: \n','[]','[]','2026-03-07 21:16:32.520171','2026-03-07 21:16:32.520337','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('eccf81cf-7c8d-4bc9-8110-5420bf85fd1c','Technical Content Writer','Company',NULL,'2026-03-10',NULL,0,'Period: Sept. 2024 – Present\n','[]','[]','2026-03-10 20:43:44.687786','2026-03-10 20:43:44.688408','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('9965210e-a722-4136-8461-628924e0083b','Bronze Medal','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-07',NULL,0,'Period: \nAwarded a bronze medal for securing third position in the fourth semester of Software Engineering. Dean’s List of Honour Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2023. Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2023. Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2024. Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2024. Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2025.','[]','[]','2026-03-07 21:16:32.521010','2026-03-07 21:16:32.521177','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('8da31177-29b4-4da5-9092-7ae14c442f24','Co-Lead, Outreach Team','Zindigi',NULL,'2026-03-11',NULL,0,'Period: Oct. 2023 – Sept. 2024\n• Co-led the outreach team for Zindigi Prize, a society aimed at helping startups pitch their ideas and get support.\n• Organized information sessions, coordinated guest speakers, and managed event logistics to explain Zindigi Prize\nand encourage startups to participate.\n• Collaborated with the team to plan outreach activities, handle communications, and ensure the smooth running of\nevents.','[]','[]','2026-03-11 01:31:03.428795','2026-03-11 01:31:03.430405','79e724c2-e159-484b-8869-7a3f09796d66'),
('2a104fe0-a37c-45b3-b6db-8e6f1b1e924a','Bronze Medal','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-10',NULL,0,'Period: \nAwarded a bronze medal for securing third position in the fourth semester of Software Engineering. Dean’s List of Honour Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2023. Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2023. Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2024. Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2024. Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2025.','[]','[]','2026-03-10 20:43:44.691267','2026-03-10 20:43:44.691346','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('43645acd-361b-4b47-be63-9100c0c35a2b','Achievements','FAST NUCES',NULL,'2026-03-11',NULL,0,'Period: \nBronze Medal\n• Awarded a bronze medal for securing third position in the fourth semester of Software Engineering.\nDean’s List of Honour\n• Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2023.\n• Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2023.\n• Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2024.\n• Inscribed in the Dean’s List of Honour for excellent academic achievements in Fall 2024.\n• Inscribed in the Dean’s List of Honour for excellent academic achievements in Spring 2025.','[]','[]','2026-03-11 01:31:03.435121','2026-03-11 01:31:03.436770','79e724c2-e159-484b-8869-7a3f09796d66'),
('f10fdb0f-e1bd-40a4-8356-92277577e28e','Co-Lead, Outreach T eam','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-07',NULL,0,'Period: Oct. 2023 – Sept. 2024\n','[]','[]','2026-03-07 21:16:32.517621','2026-03-07 21:16:32.517812','48ece145-e5a5-46c9-9a90-fb62549b20c3'),
('dad04bf1-07e1-4f41-80de-d75070abd240','Zindigi Prize Peshawar, KP','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-10',NULL,0,'Period: \nCo-led the outreach team for Zindigi Prize, a society aimed at helping startups pitch their ideas and get support. Organized information sessions, coordinated guest speakers, and managed event logistics to explain Zindigi Prize and encourage startups to participate. Collaborated with the team to plan outreach activities, handle communications, and ensure the smooth running of events.','[]','[]','2026-03-10 20:43:44.689735','2026-03-10 20:43:44.689817','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('c6ee5999-7199-4685-904e-d78300ae0911','Achievements','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-10',NULL,0,'Period: \n','[]','[]','2026-03-10 20:43:44.690332','2026-03-10 20:43:44.690417','96a3a0e1-0cfa-45b2-964e-fc67474ba892'),
('8af9ff49-5df9-4bb2-85f3-e51592b7d041','Technical Content Writer','Syntax Scenarios',NULL,'2026-04-23',NULL,0,'Period: Sept. 2024 – May 2025\n• Wrote six articles on different topics in Python and Mojo.\n• Created nine sets of scenario-based questions for C, covering basic programming concepts from operators to\nstructures.\n• Developed four sets of scenario-based questions for C++.','[]','[]','2026-04-23 14:55:19.876922','2026-04-23 14:55:19.877042','8ab28678-2048-4951-b497-320777e9f0b6'),
('7109fc57-fe3f-4cee-8a7d-ebf217dfe00a','Technical Content Writer','Syntax Scenarios',NULL,'2026-03-11',NULL,0,'Period: Sept. 2024 – Present\n• Wrote six articles on different topics in Python and Mojo.\n• Created nine sets of scenario-based questions for C, covering basic programming concepts from operators to\nstructures.\n• Developed four sets of scenario-based questions for C++ and am working to cover the full C++ course.','[]','[]','2026-03-11 01:31:03.425407','2026-03-11 01:31:03.425714','79e724c2-e159-484b-8869-7a3f09796d66'),
('c3253a9e-218c-488e-b0b3-feab83028085','Co-Lead, Outreach Team','Syntax Scenario Profile: Syntax Scenarios',NULL,'2026-03-10',NULL,0,'Period: Oct. 2023 – Sept. 2024\n','[]','[]','2026-03-10 20:43:44.689140','2026-03-10 20:43:44.689227','96a3a0e1-0cfa-45b2-964e-fc67474ba892');
/*!40000 ALTER TABLE `work_experience` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25  0:35:44

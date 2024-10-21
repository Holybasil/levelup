"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import CodeEditor from "./CodeEditor";
import DiffEditorComponent from "./DiffEditor";
import SubmitButton from "./SubmitButton";
import Modal from "./Modal";
import { CODE_SOLUTIONS } from "@/constants/solidity/code-solutions";
import { CODE_EXERCISES } from "@/constants/solidity/code-exercises";

import { Box, Stack, Tooltip } from "@mui/material";

import Button from "@/components/Button";
import EditorTooltip from "@/components/EditorTooltip";

const IdeComponent = ({ exercise = "exercise1", onComplete }) => {
  const [code, setCode] = useState("");
  const [tries, setTries] = useState<number>(0);
  const [solutionViewer, setSolutionViewer] = useState<boolean>(false);
  const [showSolutionButton, setShowSolutionButton] = useState<boolean>(false);
  const [completedExerciseNumber, setCompletedExerciseNumber] =
    useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { slug: lessonKey } = useParams();

  const { codeSolution, codeTemplate } = useMemo(() => {
    if (CODE_SOLUTIONS[lessonKey] && CODE_EXERCISES[lessonKey]) {
      return {
        codeSolution: CODE_SOLUTIONS[lessonKey][exercise],
        codeTemplate: CODE_EXERCISES[lessonKey][exercise],
      };
    }
    return { codeSolution: "", codeTemplate: "" };
  }, [lessonKey, exercise]);

  const submissionHandler = (isCorrect: boolean) => {
    console.log("isCorrect", isCorrect);
    if (isCorrect) {
      const currentExerciseNumber = parseInt(exercise.replace("exercise", ""));
      if (currentExerciseNumber > completedExerciseNumber) {
        onComplete(currentExerciseNumber);
        setCompletedExerciseNumber(currentExerciseNumber);
      }

      setSolutionViewer(false);
      setTries(0);
    } else {
      setTries(() => {
        const newTries = tries + 1;
        if (newTries > 2) {
          setSolutionViewer(true);
        }
        return newTries;
      });
    }
  };

  const handleSolutionButtonClick = (reveal: boolean) => {
    setShowSolutionButton((prevShowed) => !prevShowed);
    setSolutionViewer(reveal);
    setTries(0);
  };

  useEffect(() => {
    if (completedExerciseNumber === 5) {
      setIsModalOpen(true);
    }
  }, [completedExerciseNumber]);

  return (
    <Box>
      <Modal
        isOpen={isModalOpen}
        isClose={() => setIsModalOpen(false)}
        code={code}
      />
      {showSolutionButton ? (
        <Box position="relative">
          <DiffEditorComponent code={code} codeSolution={codeSolution} />
          <Box position="absolute" left={4} bottom={4}>
            <Tooltip title="Back to code">
              <Button
                onClick={() => handleSolutionButtonClick(false)}
                variant="contained"
                sx={{
                  backgroundColor: "transparent",
                  color: "white",
                  opacity: "0.3",
                }}
              >
                Code
              </Button>
            </Tooltip>
          </Box>
        </Box>
      ) : (
        <Box position="relative">
          <CodeEditor
            codeTemplate={codeTemplate}
            code={code}
            codeSolution={codeSolution}
            onChange={(code) => setCode(code || "")}
            onSubmission={(isCorrect) => {
              submissionHandler(isCorrect);
            }}
          />
          <Stack
            direction="row"
            spacing="15px"
            sx={{
              position: "absolute",
              bottom: "50px",
              width: "100%",
              px: "60px",
            }}
          >
            <EditorTooltip
              title="You can only view this solution once"
              placement="top"
            >
              <Box sx={{ width: "50%" }}>
                <Button
                  variant="contained"
                  disabled={!solutionViewer}
                  size="large"
                  sx={{
                    visibility: solutionViewer ? "visible" : "hidden",
                    width: "100%",
                    opacity: 0.2,
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => handleSolutionButtonClick(true)}
                >
                  Answers
                </Button>
              </Box>
            </EditorTooltip>
            <SubmitButton
              sx={{ width: "50%" }}
              code={code}
              codeSolution={codeSolution}
              onSubmission={(isCorrect) => {
                submissionHandler(isCorrect);
              }}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default IdeComponent;

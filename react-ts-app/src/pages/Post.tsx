import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { createStyles, makeStyles, TextField, Checkbox, FormControl, FormLabel, FormGroup, FormControlLabel, Theme } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';

import { createPost, getMealName } from "./../api"
import { asyncLocalStorage } from "../utils"
import useLoginRedirect from '../hooks/useLoginRedirect'
import EarnBadge from "./EarnBadge"
import ErrorMessage from './../components/ErrorMessage'


console.log(getMealName())

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      position: 'absolute',
      width: "100%",
      height: "100%",
      background: "rgba(255, 255, 255, 0.5)",
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      // backgroundOpacity
    },
    button: {
      margin: "20px 10px"
    }
  }),
);

interface BadgeType {
  meal_name: string;
  badge_level: number;
}


const Post: React.FC = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const [img, setImg] = useState<any>();
  const [mealUrl, setMealUrl] = useState("")
  const [comment, setComment] = useState("")
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [badges, setBadges] = useState<BadgeType[]>();
  const [mealName, setMealName] = useState([{ meal_name: "" }]);
  useLoginRedirect()
  const history = useHistory()
  const classes = useStyles();

  useEffect(() => {
    const f = async () => {
      await getMealName()
        .then(res => {
          setMealName(res.results)
        })
        .catch((err) => {
          setErrorMessage(err.message);
        });
    };
    f()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const curPost = {
      meal_name1: checked[0] ? checked[0] : "",
      meal_name2: checked[1] ? checked[1] : "",
      meal_name3: checked[2] ? checked[2] : "",
      meal_name4: checked[3] ? checked[3] : "",
      meal_name5: checked[4] ? checked[4] : "",
      image: img,
      meal_url: mealUrl,
      post_comment: comment
    }

    const jwtToken: any = await asyncLocalStorage.getItem("access_token").catch(err => console.log(err))
    console.log(jwtToken);
    await createPost(jwtToken, curPost)
      .then(res => {
        const badges = res.get_badges;
        if (!badges) setErrorMessage("badges == undefined")
        else if (badges.length === 0) {
          history.push("/mypage")
        } else {
          setBadges(badges);
          setIsOpen(true)
        }
      })
      .catch(err => { setErrorMessage(err.message) })
  }

  const handleCheck = (meal_name: string) => {
    let newChecked;

    if (checked.indexOf(meal_name) >= 0) {
      newChecked = checked.filter(item => item !== meal_name)
    } else {
      newChecked = [...checked, meal_name];
    }
    setChecked(newChecked);
  }

  const testProps = [{ meal_name: "test", badge_level: 2 }, { meal_name: "test", badge_level: 2 }];


  return (
    <Container component="main" maxWidth="xs">
      <div style={{ textAlign: "center" }}>
        <ErrorMessage message={errorMessage} />
        <div className="back_post">
          <h3 id="h3_back">Post Your Meal</h3>
        </div>
        <div className="post_form">
          <form onSubmit={onSubmit}>
            <div className="post_content">
              <FormControl required>
                <FormLabel><p>料理を選択してください（最大5つ）</p></FormLabel>
                <FormGroup row onChange={(e) => handleCheck((e.target as HTMLInputElement).value)}>
                  {mealName ? mealName.map((item, index) => {
                    return <FormControlLabel label={item.meal_name} value={item.meal_name} key={index} control={<Checkbox />} />
                  }) : ""}
                </FormGroup>
              </FormControl>
            </div>
            <div className="post_content">
              <TextField
                value={comment}
                onChange={e => setComment(e.target.value)}
                label="コメント"
                className="form_inside"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
              /></div>
            <div className="post_content">
              <TextField fullWidth value={mealUrl} onChange={e => setMealUrl(e.target.value)} label="参考にしたレシピのURL（任意）" className="form_inside" variant="outlined" />
            </div>
            <div className="post_content">
              <p>画像ファイルを選択してください</p>
              <input type="file" onChange={e => {
                let file = e.target.files![0];
                let reader: FileReader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                  setImg(reader.result);
                };
              }} accept="image/*" />
            </div>
            <Button fullWidth variant="contained" type="submit" style={{ backgroundColor: "#f4a460" }}>
              登録
          </Button>
          </form>
        </div>
        <Modal
          open={isOpen}
          onClose={() => {
            setIsOpen(false)
            history.push("/mypage")
          }}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%)`,
            display: "flex",
            alignItems: "flex-end",
          }}
          className={classes.paper}
          disableScrollLock
        >
          <div >
            <div style={{ width: "100%", left: "50%", transform: `translate(50%, 0%)` }}>
              <EarnBadge earnedBadges={badges} />
            </div>
          </div>
        </Modal>
      </div >
      {/* <button onClick={() => setIsOpen(!isOpen)}>aaa</button> */}
    </Container>
  )
}

export default Post;
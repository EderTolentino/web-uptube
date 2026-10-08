import "./RadioReport.scss"
import React from "react";
import {useForm} from "react-hook-form";
import {Button} from "react-bootstrap";
import axios from "axios";

function RadioReport(props) {
    const API_URL = 'http://localhost:3001';
    axios.defaults.withCredentials = true;
    const {register, handleSubmit, formState, setError, watch} = useForm();
    const video_id = props.videoId;

    const postReport = async (values) => {
        const inputReport = {
            video_id,
            reason: values.reason
        }
        try {
            await axios.post(`${API_URL}/interaction/insert_report`, inputReport).then((res) => {
                console.log(res.data);
            });
        } catch (err) {
            console.log(err);
        }
        props.submit();
    }

    return <div className='RadioReport' onClick={e=>e.stopPropagation()} >
        <h2>Reportar vídeo</h2>
        <form className={"report-video"} onSubmit={handleSubmit(postReport)}>
            <div className="radio">
                <label className='label'>
                    <input type='radio'  className='option' required="required" value='sex' {...register("reason")}/>
                    Conteúdo sexual
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='violent' {...register("reason")}/>
                    Conteúdo violento
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='abusive' {...register("reason")}/>
                    Conteúdo abusivo
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='dangerous' {...register("reason")}/>
                    Atos perigosos
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='misinformation' {...register("reason")}/>
                    Desinformação
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='child abuse' {...register("reason")}/>
                    Abuso infantil
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='promotes terrorism' {...register("reason")}/>
                    Conteúdo terrorista
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='spam' {...register("reason")}/>
                    Spam
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='infringes my rights' {...register("reason")}/>
                    Infringe meus direitos
                </label>
            </div>
            <div className="radio" >
                <label>
                    <input type='radio' className='option' required="required" value='captions issues'  {...register("reason")}/>
                    Problemas com legenda
                </label>
            </div>
            {formState.errors["reason"] && <span>{formState.errors["reason"].message}</span>}
            <div className='send_area'>
                <div className='buttons'>
                    <div className='cancel' onClick={() => {
                        props.submit();
                    }}>Cancelar</div>
                    <Button className='send' type={"submit"} >ENVIAR</Button>
                </div>
            </div>
        </form>
    </div>
}

export default RadioReport;
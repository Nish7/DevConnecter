import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { addEducation } from '../../actions/profile';

const AddEducation = ({ addEducation, history }) => {
	const [formData, setFormData] = useState({
		school: '',
		degree: '',
		fieldofstudy: '',
		from: '',
		to: '',
		current: false,
		description: '',
	});

	const {
		school,
		degree,
		fieldofstudy,
		from,
		to,
		current,
		description,
	} = formData;

	const [toDateDisabled, toggleDisable] = useState(false);

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = (e) => {
		e.preventDefault();
		addEducation(formData, history);
	};
	return (
		<Fragment>
			<h1 className='large text-primary'>Add your Education</h1>
			<p className='lead'>
				<i className='fas fa-code-branch'></i> Add your school or any bootcamp
				you have attended
			</p>
			<small>* = required field</small>
			<form className='form' onSubmit={onSubmit}>
				<div className='form-group'>
					<input
						type='text'
						placeholder='* School or Bootcamp'
						value={school}
						onChange={(e) => onChange(e)}
						name='school'
						required
					/>
				</div>
				<div className='form-group'>
					<input
						type='text'
						placeholder='* Degree'
						name='degree'
						value={degree}
						onChange={(e) => onChange(e)}
						required
					/>
				</div>
				<div className='form-group'>
					<input
						type='text'
						placeholder='field of study'
						value={fieldofstudy}
						onChange={(e) => onChange(e)}
						name='fieldofstudy'
					/>
				</div>
				<div className='form-group'>
					<h4>From Date</h4>
					<input
						type='date'
						value={from}
						onChange={(e) => onChange(e)}
						name='from'
					/>
				</div>
				<div className='form-group'>
					<p>
						<input
							type='checkbox'
							check={current}
							value={current}
							onChange={(e) => {
								setFormData({ ...formData, current: !current });
								toggleDisable(!toDateDisabled);
							}}
							name='current'
						/>{' '}
						Currently Attending
					</p>
				</div>
				<div className='form-group'>
					<h4>To Date</h4>
					<input
						value={to}
						onChange={(e) => onChange(e)}
						type='date'
						name='to'
						disabled={toDateDisabled ? 'disabled' : ''}
					/>
				</div>
				<div className='form-group'>
					<textarea
						name='description'
						cols='30'
						rows='5'
						value={description}
						onChange={(e) => onChange(e)}
						placeholder='Program Description'></textarea>
				</div>
				<input type='submit' className='btn btn-primary my-1' />
				<Link className='btn btn-light my-1' href='/dashboard'>
					Go Back
				</Link>
			</form>
		</Fragment>
	);
};

AddEducation.propTypes = {
	addEducation: PropTypes.func.isRequired,
};

export default connect(null, { addEducation })(withRouter(AddEducation));
